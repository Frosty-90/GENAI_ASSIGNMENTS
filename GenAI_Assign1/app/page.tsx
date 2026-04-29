"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PERSONA_LIST, type PersonaId } from "@/lib/personas";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_PERSONA = PERSONA_LIST[0];

export default function Home() {
  const [personaId, setPersonaId] = useState<PersonaId>(INITIAL_PERSONA.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const activePersona = PERSONA_LIST.find((persona) => persona.id === personaId) ?? INITIAL_PERSONA;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(rawText: string) {
    const content = rawText.trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personaId,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Something went wrong.");
      }

      const reply = data.reply;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "The assistant could not respond right now. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handlePersonaSwitch(nextPersonaId: PersonaId) {
    if (nextPersonaId === personaId || isLoading) {
      return;
    }

    setPersonaId(nextPersonaId);
    setMessages([]);
    setInput("");
    setError(null);
  }

  return (
    <main className="studio-shell">
      <section className="studio-frame">
        <aside className="persona-rail">
          <div className="rail-intro">
            <p className="eyebrow">Assignment 01</p>
            <h1>Scaler Persona Studio</h1>
            <p className="rail-copy">
              Switch between three researched voices and start a fresh conversation each time.
            </p>
          </div>

          <div className="persona-list" role="tablist" aria-label="Choose a persona">
            {PERSONA_LIST.map((persona) => {
              const isActive = persona.id === personaId;

              return (
                <button
                  key={persona.id}
                  type="button"
                  className={`persona-tab ${isActive ? "active" : ""}`}
                  onClick={() => handlePersonaSwitch(persona.id)}
                  aria-selected={isActive}
                >
                  <span className="persona-role">{persona.role}</span>
                  <strong>{persona.name}</strong>
                  <span className="persona-signature">{persona.signature}</span>
                </button>
              );
            })}
          </div>

          <div className="rail-note">
            <p className="note-label">Active persona</p>
            <p className="note-name">{activePersona.name}</p>
            <p className="note-theme">{activePersona.theme}</p>
          </div>
        </aside>

        <section className="chat-stage">
          <header className="stage-header">
            <div>
              <p className="eyebrow">Live conversation</p>
              <h2>{activePersona.name}</h2>
            </div>
            <div className="persona-badge">{activePersona.role}</div>
          </header>

          <div className="hero-panel">
            <p className="hero-kicker">Voice brief</p>
            <p className="hero-message">{activePersona.greeting}</p>
          </div>

          <section className="suggestions-panel">
            <p className="section-label">Quick start questions</p>
            <div className="suggestion-grid">
              {activePersona.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => void sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <section className="thread-panel" aria-live="polite">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p className="empty-label">Fresh thread</p>
                <p>
                  Switching personas clears the conversation so each chat starts with the correct system prompt.
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <article key={message.id} className={`message-row ${message.role}`}>
                <div className="message-meta">{message.role === "user" ? "You" : activePersona.name}</div>
                <div className="message-bubble">{message.content}</div>
              </article>
            ))}

            {isLoading ? (
              <article className="message-row assistant">
                <div className="message-meta">{activePersona.name}</div>
                <div className="message-bubble typing-bubble" aria-label="Typing">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            ) : null}

            <div ref={threadEndRef} />
          </section>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="composer-label" htmlFor="chat-input">
              Ask {activePersona.name}
            </label>
            <div className="composer-row">
              <textarea
                id="chat-input"
                className="composer-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Message ${activePersona.name}...`}
                rows={3}
                disabled={isLoading}
              />
              <button className="send-button" type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? "Thinking..." : "Send"}
              </button>
            </div>
            {error ? <p className="error-banner">{error}</p> : null}
          </form>
        </section>
      </section>
    </main>
  );
}
