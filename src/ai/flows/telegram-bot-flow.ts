'use server';
/**
 * @fileOverview An AI flow dedicated to handling Telegram bot interactions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TelegramBotInputSchema = z.string().describe('The message received from the user on Telegram.');
export type TelegramBotInput = z.infer<typeof TelegramBotInputSchema>;

const TelegramBotOutputSchema = z.string().describe('The AI generated response to be sent back to the user.');
export type TelegramBotOutput = z.infer<typeof TelegramBotOutputSchema>;

/**
 * Processes a message from a Telegram user and generates an appropriate response.
 */
export async function telegramBotResponse(input: TelegramBotInput): Promise<TelegramBotOutput> {
  return telegramBotFlow(input);
}

const botPrompt = ai.definePrompt({
  name: 'telegramBotPrompt',
  input: { schema: TelegramBotInputSchema },
  output: { schema: TelegramBotOutputSchema },
  prompt: `You are a helpful and professional assistant for EarnSub, an automated account processing platform. 
  The user is interacting with you via Telegram. 
  Answer their questions about the service, account submissions, or general inquiries politely.
  
  User Message: {{{input}}}`,
});

const telegramBotFlow = ai.defineFlow(
  {
    name: 'telegramBotFlow',
    inputSchema: TelegramBotInputSchema,
    outputSchema: TelegramBotOutputSchema,
  },
  async (input) => {
    // Handle the /start command specifically
    if (input.trim().toLowerCase() === '/start') {
      return `🚀 <b>Welcome to the EarnSub Official Bot!</b>

I am your automated assistant for the EarnSub account processing platform. 

<b>How can I help you?</b>
• Ask about how to submit account details.
• Inquire about the $1.12 per submission reward.
• Learn about the difference between Hold and Active balances.
• Get help with your wallet or account verification.

Simply type your question below to get started!`;
    }

    const { output } = await botPrompt(input);
    return output || "I'm sorry, I couldn't process that request.";
  }
);
