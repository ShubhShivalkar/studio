'use server';

/**
 * @fileOverview A personality persona generation AI agent.
 *
 * - generatePersonalityPersona - A function that handles the generation of a personality persona from journal entries.
 * - GeneratePersonalityPersonaInput - The input type for the generatePersonalityPersona function.
 * - GeneratePersonalityPersonaOutput - The return type for the generatePersonalityPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalityPersonaInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('The journal entries of the user.'),
});
export type GeneratePersonalityPersonaInput = z.infer<typeof GeneratePersonalityPersonaInputSchema>;

const GeneratePersonalityPersonaOutputSchema = z.object({
  persona: z.string().describe('The generated personality persona.'),
});
export type GeneratePersonalityPersonaOutput = z.infer<typeof GeneratePersonalityPersonaOutputSchema>;

export async function generatePersonalityPersona(input: GeneratePersonalityPersonaInput): Promise<GeneratePersonalityPersonaOutput> {
  return generatePersonalityPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalityPersonaPrompt',
  input: {schema: GeneratePersonalityPersonaInputSchema},
  output: {schema: GeneratePersonalityPersonaOutputSchema},
  prompt: `You are an AI personality generator. You will generate a personality persona based on the user's journal entries.

Journal Entries: {{{journalEntries}}}`,
});

const generatePersonalityPersonaFlow = ai.defineFlow(
  {
    name: 'generatePersonalityPersonaFlow',
    inputSchema: GeneratePersonalityPersonaInputSchema,
    outputSchema: GeneratePersonalityPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
