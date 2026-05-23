'use server';
/**
 * @fileOverview An AI-powered poultry care advisor that provides tailored advice based on user queries.
 *
 * - poultryCareAdvisor - A function that handles poultry-related queries.
 * - PoultryCareAdvisorInput - The input type for the poultryCareAdvisor function.
 * - PoultryCareAdvisorOutput - The return type for the poultryCareAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PoultryCareAdvisorInputSchema = z
  .string()
  .describe('The user\'s question about poultry care, feed management, or product preparation.');
export type PoultryCareAdvisorInput = z.infer<typeof PoultryCareAdvisorInputSchema>;

const PoultryCareAdvisorOutputSchema = z
  .string()
  .describe('Tailored advice on poultry care, feed management, or product preparation.');
export type PoultryCareAdvisorOutput = z.infer<typeof PoultryCareAdvisorOutputSchema>;

export async function poultryCareAdvisor(input: PoultryCareAdvisorInput): Promise<PoultryCareAdvisorOutput> {
  return poultryCareAdvisorFlow(input);
}

const poultryCareAdvisorPrompt = ai.definePrompt({
  name: 'poultryCareAdvisorPrompt',
  input: {schema: PoultryCareAdvisorInputSchema},
  output: {schema: PoultryCareAdvisorOutputSchema},
  prompt: `You are an expert poultry owner and advisor named Wubanchi. Your task is to provide tailored advice on poultry care, feed management, or product preparation based on the user's question. Be helpful, knowledgeable, and practical, drawing from your extensive experience.

User's Question: {{{input}}}`,
});

const poultryCareAdvisorFlow = ai.defineFlow(
  {
    name: 'poultryCareAdvisorFlow',
    inputSchema: PoultryCareAdvisorInputSchema,
    outputSchema: PoultryCareAdvisorOutputSchema,
  },
  async input => {
    const {output} = await poultryCareAdvisorPrompt(input);
    return output!;
  }
);
