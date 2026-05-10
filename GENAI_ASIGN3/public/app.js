const dropZone = document.getElementById('drop-zone');
const fileUpload = document.getElementById('file-upload');
const uploadStatus = document.getElementById('upload-status');
const documentList = document.getElementById('document-list');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');

let isDocumentUploaded = false;

// UI State Management
function updateUploadStatus(status, message) {
    uploadStatus.className = `status-message ${status}`;
    uploadStatus.innerHTML = status === 'loading' 
        ? `<div class="loader"></div><span>${message}</span>`
        : `<span>${message}</span>`;
}

function enableChat() {
    isDocumentUploaded = true;
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.placeholder = "Ask a question about the document...";
    chatInput.focus();
}

function appendDocument(filename) {
    const emptyState = documentList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const li = document.createElement('li');
    li.textContent = filename;
    documentList.appendChild(li);
}

function appendMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    
    if (role === 'system') {
        avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 12"></path><path d="M12 12 21.9 12"></path><path d="M12 12 12 21.9"></path><path d="M12 12 12 2.1"></path></svg>';
    } else {
        avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    // Use innerHTML to allow some basic formatting or line breaks, simple approach
    content.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatHistory.appendChild(messageDiv);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// File Upload Handling
async function handleFileUpload(file) {
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        updateUploadStatus('error', 'Only PDF or Text files are supported.');
        return;
    }

    const formData = new FormData();
    formData.append('document', file);

    updateUploadStatus('loading', 'Chunking and indexing document...');
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            updateUploadStatus('success', 'Document indexed successfully!');
            appendDocument(file.name);
            enableChat();
            
            // Auto hide success message after 3s
            setTimeout(() => {
                uploadStatus.classList.add('hidden');
            }, 3000);
        } else {
            throw new Error(data.error || 'Failed to process document');
        }
    } catch (error) {
        console.error('Upload Error:', error);
        updateUploadStatus('error', error.message);
    }
}

// Drag & Drop Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
    }
});

fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileUpload(e.target.files[0]);
    }
});

// Chat Handling
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = chatInput.value.trim();
    if (!query) return;

    // Show user message
    appendMessage('user', query);
    chatInput.value = '';
    
    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (response.ok) {
            appendMessage('system', data.answer);
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('Chat Error:', error);
        appendMessage('system', `Error: ${error.message}`);
    } finally {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
});
