'use server';
/**
 * @fileOverview A flow to generate professional farm imagery using AI.
 *
 * - generateFarmHero - A function that generates a hero image based on a prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('Description of the farm scene to generate.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateFarmHero(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateFarmHeroFlow(input);
}

const generateFarmHeroFlow = ai.defineFlow(
  {
    name: 'generateFarmHeroFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A stunning, high-resolution professional photograph of an Ethiopian poultry farm: ${input.prompt}. Cinematic lighting, vibrant colors, 8k, ultra-realistic.`,
    });

    if (!media?.url) {
      throw new Error('Failed to generate image');
    }

    return { imageUrl: media.url };
  }
);
