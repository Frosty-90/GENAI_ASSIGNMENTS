import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { v4 as uuidv4 } from "uuid";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const COLLECTION_NAME = "notebooklm_docs_" + Date.now();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(os.tmpdir(), "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Global vector store instance
let vectorStore = null;

// Custom Memory Vector Store Fallback (cosine similarity)
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class SimpleMemoryVectorStore {
    constructor(embeddings) {
        this.embeddings = embeddings;
        this.store = [];
    }
    async addDocuments(docs) {
        const texts = docs.map(d => d.pageContent);
        const vectors = await this.embeddings.embedDocuments(texts);
        for (let i = 0; i < docs.length; i++) {
            this.store.push({ doc: docs[i], vector: vectors[i] });
        }
    }
    asRetriever({ k = 5 } = {}) {
        return {
            invoke: async (query) => {
                const queryVector = await this.embeddings.embedQuery(query);
                const similarities = this.store.map(item => {
                    const sim = cosineSimilarity(queryVector, item.vector);
                    return { doc: item.doc, sim };
                });
                similarities.sort((a, b) => b.sim - a.sim);
                return similarities.slice(0, k).map(item => item.doc);
            }
        };
    }
}

// Initialize Vector Store
async function getVectorStore() {
    if (vectorStore) return vectorStore;

    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2",
        apiKey: process.env.GEMINI_API_KEY
    });

    try {
        if (process.env.QDRANT_URL) {
            console.log("Attempting to connect to Qdrant Vector DB...");

            // Proactively test if Qdrant is actually running locally
            try {
                await fetch(process.env.QDRANT_URL);
            } catch (connectionError) {
                throw new Error("Qdrant is not running at " + process.env.QDRANT_URL);
            }

            vectorStore = new QdrantVectorStore(embeddings, {
                url: process.env.QDRANT_URL,
                collectionName: COLLECTION_NAME
            });
            console.log("Connected to Qdrant.");
        } else {
            throw new Error("QDRANT_URL not provided.");
        }
    } catch (error) {
        console.warn("Could not initialize Qdrant. Falling back to in-memory VectorStore for demonstration.", error.message);
        vectorStore = new SimpleMemoryVectorStore(embeddings);
    }

    return vectorStore;
}

// Upload & Index Endpoint
app.post("/api/upload", upload.single("document"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is missing in .env" });
        }

        const filePath = req.file.path;
        let docs = [];

        if (req.file.mimetype === 'application/pdf') {
            const loader = new PDFLoader(filePath);
            docs = await loader.load();
        } else if (req.file.mimetype === 'text/plain') {
            const textContent = fs.readFileSync(filePath, 'utf-8');
            docs = [new Document({ pageContent: textContent, metadata: { source: filePath } })];
        } else {
            return res.status(400).json({ error: "Unsupported file type." });
        }

        /**
         * 2. Chunking Strategy: Recursive Character Text Splitting
         * 
         * Documentation:
         * We use the RecursiveCharacterTextSplitter because it's the recommended text splitter for generic text.
         * It tries to split on paragraphs first, then sentences, then words, which preserves semantic meaning 
         * better than simply splitting at hard character counts.
         * 
         * - chunkSize: 1000 characters. Large enough to capture context, small enough to fit well in LLM context windows.
         * - chunkOverlap: 200 characters. Ensures continuity between chunks so we don't cut off important context 
         *   mid-sentence across two chunks.
         */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);
        console.log(`Split document into ${splitDocs.length} chunks.`);

        // 3. Embedding & Storage (Indexing)
        const vStore = await getVectorStore();
        await vStore.addDocuments(splitDocs);
        console.log("Indexing completed successfully.");

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        res.json({ success: true, chunks: splitDocs.length });
    } catch (error) {
        console.error("Error processing document:", error);
        res.status(500).json({ error: error.message || "Failed to process document" });
    }
});

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required." });
        }

        if (!vectorStore) {
            return res.status(400).json({ error: "No documents have been indexed yet. Please upload a document first." });
        }

        // 4. Retrieval: Fetch relevant chunks
        const retriever = vectorStore.asRetriever({
            k: 5 // Retrieve top 5 most relevant chunks
        });

        const retrievedChunks = await retriever.invoke(query);

        if (!retrievedChunks || retrievedChunks.length === 0) {
            return res.json({ answer: "I could not find relevant information in the uploaded document to answer your query." });
        }

        // 5. Generation: Construct the prompt and call the LLM
        const chatModel = new ChatGoogleGenerativeAI({
            modelName: "gemini-2.5-flash", // Fast and cost-effective model
            temperature: 0, // Deterministic answers based on context
            apiKey: process.env.GEMINI_API_KEY
        });

        const context = retrievedChunks.map(chunk => chunk.pageContent).join("\n\n---\n\n");

        const systemPrompt = `You are a helpful AI Assistant for a NotebookLM clone. Your job is to answer the user's query strictly based on the provided context.
        
        Rules:
        - ONLY answer based on the available context from the uploaded file.
        - If the answer is not contained in the context, say "I cannot answer this based on the provided document." DO NOT use your general knowledge.
        - Be concise, accurate, and helpful.
        
        Context:
        ${context}`;

        const response = await chatModel.invoke([
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
        ]);

        res.json({ answer: response.content });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: error.message || "Failed to generate answer" });
    }
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`NotebookLM Clone running at http://localhost:${PORT}`);
    });
}

export default app;
