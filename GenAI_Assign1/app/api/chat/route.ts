import { NextResponse } from "next/server";
import { PERSONAS, type PersonaId } from "@/lib/personas";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export const runtime = "nodejs";

function isPersonaId(value: string): value is PersonaId {
  return value in PERSONAS;
}

async function createGeminiReply(systemPrompt: string, messages: ChatMessage[]) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 500,
      },
    }),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API request failed.");
  }

  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing GEMINI_API_KEY. Put it in .env.local and restart the Next.js server.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      personaId?: string;
      messages?: ChatMessage[];
    };

    if (!body.personaId || !isPersonaId(body.personaId)) {
      return NextResponse.json({ error: "Invalid persona selected." }, { status: 400 });
    }

    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];
    const trimmedMessages = incomingMessages
      .filter(
        (message): message is ChatMessage =>
          Boolean(
            message &&
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string" &&
              message.content.trim(),
          ),
      )
      .slice(-12);

    if (!trimmedMessages.length) {
      return NextResponse.json({ error: "Please send a message to start the conversation." }, { status: 400 });
    }

    const persona = PERSONAS[body.personaId];
    const reply = await createGeminiReply(persona.systemPrompt, trimmedMessages);

    if (!reply) {
      return NextResponse.json(
        { error: "The model returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      {
        error:
          "The assistant could not respond right now. Please check your Gemini key, Gemini model access, or network connection and try again.",
      },
      { status: 500 },
    );
  }
}
