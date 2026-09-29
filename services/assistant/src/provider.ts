import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core/mastra";

import { config } from "./config.js";

type ChatMessage = { role: "user" | "assistant"; content: string };

export class ProviderError extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly publicMessage: string,
  ) {
    super(publicMessage);
  }
}

const SYSTEM_PROMPT = [
  "You are Dots, a personal assistant available whenever the user opens this chat.",
  "Help with planning, writing, analysis, and decisions. Be concise, useful, and clear about uncertainty.",
  "You can only use information in this conversation. Do not claim to have researched the web or accessed calendars, email, files, websites, or other tools.",
  "Do not claim to have scheduled reminders, sent notifications, taken background actions, or completed outside tasks.",
  "When the user asks for an action you cannot perform, help prepare the next concrete step and say what is needed.",
].join(" ");

const MAX_HISTORY_MESSAGES = 30;
const MAX_HISTORY_CHARS = 64_000;
let runtime: Mastra | undefined;

// The database is the sole conversation memory. Explicitly bound the context sent on each paid call.
export function boundedHistory(history: ChatMessage[]): ChatMessage[] {
  const selected: ChatMessage[] = [];
  let remaining = MAX_HISTORY_CHARS;
  for (let index = history.length - 1; index >= 0 && selected.length < MAX_HISTORY_MESSAGES && remaining > 0; index--) {
    const message = history[index];
    const content = message.content.slice(0, remaining);
    if (content) {
      selected.push({ role: message.role, content });
      remaining -= content.length;
    }
  }
  return selected.reverse();
}

function getAssistant(): Agent {
  runtime ??= new Mastra({
    agents: {
      conversation: new Agent({
        id: "dots-conversation",
        name: "Dots Personal Assistant",
        instructions: SYSTEM_PROMPT,
        model: `openrouter/${config.openRouterModel}`,
        // BullMQ owns retries. A hidden Mastra retry could duplicate a billable call.
        maxRetries: 0,
      }),
    },
    // Provider errors can contain request/response bodies. Keep those out of Render logs.
    logger: false,
  });
  return runtime.getAgent("conversation");
}

export function classifyModelError(error: unknown): ProviderError {
  const upstream = error as { statusCode?: unknown; status?: unknown; name?: unknown } | null;
  const status = typeof upstream?.statusCode === "number"
    ? upstream.statusCode
    : typeof upstream?.status === "number" ? upstream.status : null;
  const retryable = status === null || status === 408 || status === 429 || status >= 500;
  return new ProviderError(
    retryable ? "provider_busy" : "provider_rejected",
    retryable,
    retryable ? "Dots is temporarily busy. Please try again." : "Dots could not process this request.",
  );
}

export async function generateReply(history: ChatMessage[]): Promise<string> {
  if (!config.openRouterKey || !config.openRouterModel) {
    throw new ProviderError("provider_rejected", false, "Dots could not process this request.");
  }
  const messages = boundedHistory(history).map((message) => message.role === "user"
    ? { role: "user" as const, content: message.content }
    : { role: "assistant" as const, content: message.content });
  if (messages.length === 0) {
    throw new ProviderError("message_missing", false, "Dots could not find the message to answer.");
  }

  try {
    const output = await getAssistant().generate(messages, {
      model: { id: `openrouter/${config.openRouterModel}`, apiKey: config.openRouterKey },
      maxSteps: 1,
      modelSettings: { maxOutputTokens: 2500, temperature: 0.7 },
      abortSignal: AbortSignal.timeout(config.openRouterTimeoutMs),
    });
    const text = output.text?.trim();
    if (!text) {
      throw new ProviderError("provider_empty_response", true, "Dots received an empty model response.");
    }
    return text;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw classifyModelError(error);
  }
}
