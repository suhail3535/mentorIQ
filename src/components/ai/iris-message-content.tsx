"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Lightweight renderer that turns Iris's plain text into something nice:
 * - ```fenced code blocks``` get a code card with copy button
 * - `inline code` gets a subtle pill
 * - **bold** is rendered
 * Everything else is plain text with preserved whitespace.
 *
 * Deliberately tiny: avoids pulling react-markdown / hljs into the bundle.
 */
export function IrisMessageContent({ text }: { text: string }) {
  const blocks = splitFencedBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeCard key={i} code={b.code} lang={b.lang} />
        ) : (
          <InlineText key={i} text={b.text} />
        ),
      )}
    </div>
  );
}

type Block =
  | { type: "text"; text: string }
  | { type: "code"; code: string; lang?: string };

function splitFencedBlocks(text: string): Block[] {
  const re = /```([a-zA-Z0-9_+\-.]*)\n([\s\S]*?)```/g;
  const out: Block[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", text: text.slice(last, m.index) });
    }
    out.push({ type: "code", lang: m[1] || undefined, code: m[2] ?? "" });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ type: "text", text: text.slice(last) });
  }
  if (out.length === 0) out.push({ type: "text", text });
  return out;
}

function InlineText({ text }: { text: string }) {
  // Split into runs of: code (`...`), bold (**...**), or plain.
  const tokens: { kind: "code" | "bold" | "text"; value: string }[] = [];
  const re = /(`[^`\n]+`)|(\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      tokens.push({ kind: "text", value: text.slice(last, m.index) });
    if (m[1]) tokens.push({ kind: "code", value: m[1].slice(1, -1) });
    else if (m[2]) tokens.push({ kind: "bold", value: m[2].slice(2, -2) });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: "text", value: text.slice(last) });
  if (tokens.length === 0) tokens.push({ kind: "text", value: text });

  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {tokens.map((t, i) => {
        if (t.kind === "code")
          return (
            <code
              key={i}
              className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]"
            >
              {t.value}
            </code>
          );
        if (t.kind === "bold")
          return (
            <strong key={i} className="font-semibold">
              {t.value}
            </strong>
          );
        return <span key={i}>{t.value}</span>;
      })}
    </p>
  );
}

function CodeCard({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[#0b0b13] text-slate-100 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-400">
        <span>{lang || "code"}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 text-[12.5px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
