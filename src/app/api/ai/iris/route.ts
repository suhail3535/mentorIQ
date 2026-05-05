import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { openai, AI_MODEL } from "@/ai/client";
import { IRIS_SYSTEM_PROMPT } from "@/ai/iris/system-prompt";
import { checkRateLimit, getClientKey } from "@/ai/iris/rate-limit";
import { submitInquiryTool } from "@/ai/iris/tools/submit-inquiry";

export const runtime = "nodejs";

const MAX_INPUT_CHARS = 4000;
const MAX_HISTORY = 20;

export async function POST(req: Request) {
  // Public endpoint — no auth, but tightly capped.
  const key = getClientKey(req);
  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return Response.json(
      {
        error: `You've hit the message limit. Try again in ${Math.ceil(
          limit.retryAfterSec / 60,
        )} minute(s).`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
        },
      },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const trimmed = messages.slice(-MAX_HISTORY);
  for (const m of trimmed) {
    const text = (m.parts ?? [])
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");
    if (text.length > MAX_INPUT_CHARS) {
      return Response.json(
        {
          error: `Message too long (${text.length} chars). Please keep it under ${MAX_INPUT_CHARS}.`,
        },
        { status: 413 },
      );
    }
  }

  const modelMessages = await convertToModelMessages(trimmed);

  const result = streamText({
    model: openai(AI_MODEL),
    system: IRIS_SYSTEM_PROMPT,
    messages: modelMessages,
    temperature: 0.7,
    tools: { submitInquiry: submitInquiryTool },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
