'use server';
/**
 * @fileOverview A flow to translate content to Amharic using AI.
 *
 * - translateToAmharic - A function that translates English text to Amharic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateInputSchema = z.string().describe('The English text to translate.');
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.string().describe('The Amharic translation.');
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translateToAmharic(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const translateFlow = ai.defineFlow(
  {
    name: 'translateToAmharic',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `You are a professional Ethiopian translator. Translate the following English text into Amharic (using Ethiopic Ge'ez script). 
      The context is an organic poultry and fish farm business named 'Wubanchi' in Bahir Dar, Ethiopia.
      Ensure the translation is natural, respectful, and culturally appropriate for the Amhara region.
      
      Text to translate: ${input}`,
    });
    return text;
  }
);
