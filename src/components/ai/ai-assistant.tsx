"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ai/chat-message";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Add a mentor named Jane Doe, jane@school.edu",
  "Create a course called Algebra 101",
  "Find student from list",
  "How many students do we have?",
];

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  isAdmin: boolean;
};
const AIContext = createContext<Ctx | null>(null);

/** Hook used by triggers anywhere in the dashboard tree. */
export function useAIAssistant() {
  const ctx = useContext(AIContext);
  if (!ctx)
    throw new Error("useAIAssistant must be used inside <AIAssistantProvider>");
  return ctx;
}

/** Wrap the dashboard tree so any page can open the AI panel. */
export function AIAssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <AIContext.Provider value={{ open, setOpen, isAdmin }}>
      {children}
      {isAdmin && <AIAssistantPanel />}
    </AIContext.Provider>
  );
}

function AIAssistantPanel() {
  const { open, setOpen } = useAIAssistant();
  const { data: session } = useSession();
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/agent" }),
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
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function quickSend(text: string) {
    if (isStreaming) return;
    sendMessage({ text });
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 flex w-[440px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all sm:w-[560px] lg:w-[640px]",
        open
          ? "h-[680px] max-h-[calc(100vh-3rem)] opacity-100"
          : "pointer-events-none h-0 opacity-0",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Mentor</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Your admin co-pilot
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Hi {session?.user?.name?.split(" ")[0]} 👋
              </p>
              <p className="max-w-[260px] text-xs text-[var(--muted-foreground)]">
                I can help you add students and mentors.
                <br />
                I can help you add courses.
                <br />
                I can find any student and total students.
                <br />
                I can help you update and delete students and mentors.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => quickSend(s)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-xs text-[var(--muted-foreground)] transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-[var(--foreground)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Mentor is thinking…
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
          placeholder="Ask Mentor anything…  (Shift+Enter for new line)"
          rows={1}
          className="max-h-[180px] min-h-[40px] flex-1 resize-none overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Button
          type="submit"
          variant="gradient"
          size="icon"
          disabled={!input.trim() || isStreaming}
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

/**
 * Reusable launcher button. Place anywhere inside the dashboard tree.
 * Renders nothing for non-admins.
 */
export function AIAssistantTrigger({
  buttonText = "AI bot",
  label = "Try AI Assistance",
  className,
}: {
  /** Visible label next to the icon */
  buttonText?: string;
  /** Accessible name and hover tooltip */
  label?: string;
  className?: string;
}) {
  const { isAdmin, setOpen, open } = useAIAssistant();
  if (!isAdmin) return null;

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={label}
        className={cn(
          "relative inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 px-3 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg",
          className,
        )}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
          {buttonText}
        </span>
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
        </span>
      </button>
      {/* Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute right-1/2 top-full z-50 mt-2 translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        {label}
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--card)]" />
      </div>
    </div>
  );
}
