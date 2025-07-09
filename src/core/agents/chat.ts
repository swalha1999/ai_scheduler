import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const replayToWhatsapp = async (message: string) => {
    const { text } = await generateText({
        model: anthropic('claude-3-haiku-20240307'),
        system: 'You are a helpful assistant that can answer questions and help with tasks.',
        prompt: `say hello to the user: ${message}`,
      });

    return text;
}