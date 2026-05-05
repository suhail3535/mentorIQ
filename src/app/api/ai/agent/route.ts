import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";
import { openai, AI_MODEL } from "@/ai/client";
import { SYSTEM_PROMPT } from "@/ai/system-prompt";
import { buildAgentTools } from "@/ai/tools";
import { auth } from "@/lib/auth";
import { fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  if (session.user.role !== "ADMIN") return fail("Forbidden", 403);

  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai(AI_MODEL),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: buildAgentTools({ adminId: session.user.id }),
    stopWhen: stepCountIs(15),
  });

  return result.toUIMessageStreamResponse();
}
