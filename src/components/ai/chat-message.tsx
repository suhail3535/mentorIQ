"use client";

import { Bot, User as UserIcon, Wrench, CheckCircle2, XCircle } from "lucide-react";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
            : "bg-[var(--muted)] text-[var(--foreground)]",
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className="whitespace-pre-wrap">
                {part.text}
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            const toolName = part.type.replace("tool-", "");
            // @ts-expect-error - dynamic tool part shape
            const state = part.state as string | undefined;
            // @ts-expect-error - dynamic tool part shape
            const output = part.output as { ok?: boolean; error?: string; tempPassword?: string } | undefined;

            if (state === "input-streaming" || state === "input-available") {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted-foreground)]"
                >
                  <Wrench className="h-3 w-3 animate-pulse" />
                  Calling <span className="font-mono">{toolName}</span>…
                </div>
              );
            }

            if (state === "output-available") {
              const ok = output?.ok !== false;
              return (
                <div
                  key={i}
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
                  <span className="font-mono">{toolName}</span>
                  <span>{ok ? "succeeded" : "failed"}</span>
                </div>
              );
            }

            if (state === "output-error") {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 dark:text-red-300"
                >
                  <XCircle className="h-3 w-3" />
                  <span className="font-mono">{toolName}</span> errored
                </div>
              );
            }
          }

          return null;
        })}
      </div>

      {isUser && (
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
