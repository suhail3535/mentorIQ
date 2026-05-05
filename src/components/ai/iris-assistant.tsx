"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Wand2,
  Code,
  Languages,
  Lightbulb,
  PenLine,
  User as UserIcon,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IrisMessageContent } from "@/components/ai/iris-message-content";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    icon: PenLine,
    label: "Write a polite follow-up email",
    prompt: "Write a polite follow-up email to a recruiter who hasn't replied in a week.",
  },
  {
    icon: Code,
    label: "Explain async/await in JS",
    prompt: "Explain async/await in JavaScript with a tiny code example.",
  },
  {
    icon: Languages,
    label: "Translate to Spanish",
    prompt:
      "Translate this to Spanish: 'I'd love to schedule a call next week to discuss the project.'",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm side-project ideas",
    prompt: "Brainstorm 5 side-project ideas a developer can finish in a weekend.",
  },
  {
    icon: Mail,
    label: "Get in touch with the team",
    prompt: "I'd like to get in touch with the team.",
  },
];

function getMessageText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

function getToolParts(m: UIMessage) {
  return m.parts.filter((p) => p.type.startsWith("tool-")) as Array<{
    type: string;
    state?: string;
    output?: { ok?: boolean; message?: string; error?: string };
  }>;
}

export function IrisAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/iris" }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const isStreaming = status === "submitted" || status === "streaming";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  }

  function quickSend(text: string) {
    if (isStreaming) return;
    sendMessage({ text });
  }

  function reset() {
    if (isStreaming) stop();
    setMessages([]);
  }

  return (
    <>
      {/* Floating launcher */}
      <div
        className={cn(
          "group fixed bottom-6 right-6 z-30 transition-all",
          open && "scale-90 opacity-0 pointer-events-none",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="AI assistance"
          className="relative flex h-14 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 px-5 text-white shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
        >
          <Wand2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Ask Iris</span>
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
          </span>
        </button>
        {/* Tooltip */}
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
        >
          AI assistance
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-40 flex w-[440px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all sm:w-[520px] lg:w-[600px]",
          open
            ? "h-[680px] max-h-[calc(100vh-3rem)] opacity-100"
            : "pointer-events-none h-0 opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                Iris
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)]">
                Your free AI helper
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset chat"
                onClick={reset}
                title="New chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-2 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-semibold">Hi, I&apos;m Iris.</p>
                <p className="max-w-[300px] text-xs text-[var(--muted-foreground)]">
                  Ask me anything — writing, code, ideas, translations, or
                  whatever&apos;s on your mind.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => quickSend(s.prompt)}
                    className="group flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-md"
                  >
                    <div className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-600 transition-colors group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white">
                      <s.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium leading-snug text-[var(--foreground)]">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <IrisBubble key={m.id} message={m} />
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Iris is thinking…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
              {error.message || "Something went wrong. Try again."}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={submit}
          className="flex items-end gap-2 border-t border-[var(--border)] p-3"
        >
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            placeholder="Message Iris…  (Shift+Enter for new line)"
            rows={1}
            className="max-h-[180px] min-h-[40px] flex-1 resize-none overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={stop}
              aria-label="Stop"
            >
              <span className="h-3 w-3 rounded-sm bg-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              aria-label="Send"
              className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        <p className="px-4 pb-3 text-center text-[10px] text-[var(--muted-foreground)]">
          Iris can make mistakes. Verify important info. Powered by OpenAI.
        </p>
      </div>
    </>
  );
}

function IrisBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const tools = isUser ? [] : getToolParts(message);

  return (
    <div
      className={cn(
        "flex gap-2.5",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
          <Wand2 className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
            : "bg-[var(--muted)] text-[var(--foreground)]",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {text}
          </p>
        ) : (
          <>
            {text && <IrisMessageContent text={text} />}
            {tools.map((t, i) => (
              <ToolStatusPill key={i} part={t} />
            ))}
          </>
        )}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

function ToolStatusPill({
  part,
}: {
  part: { type: string; state?: string; output?: { ok?: boolean } };
}) {
  const name = part.type.replace("tool-", "");
  const labelMap: Record<string, { sending: string; done: string }> = {
    submitInquiry: {
      sending: "Sending your message…",
      done: "Message sent to the team",
    },
  };
  const labels = labelMap[name] ?? {
    sending: `Running ${name}…`,
    done: `${name} done`,
  };

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-700 dark:text-cyan-300">
        <Loader2 className="h-3 w-3 animate-spin" />
        {labels.sending}
      </div>
    );
  }
  if (part.state === "output-available") {
    const ok = part.output?.ok !== false;
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
          ok
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
        )}
      >
        {ok ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        {ok ? labels.done : `${name} failed`}
      </div>
    );
  }
  if (part.state === "output-error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 dark:text-red-300">
        <XCircle className="h-3 w-3" />
        Couldn&apos;t complete that action
      </div>
    );
  }
  return null;
}
