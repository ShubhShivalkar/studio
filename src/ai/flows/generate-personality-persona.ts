
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
  persona: z.string().describe('A summary of the generated personality persona.'),
  hobbies: z.array(z.string()).describe("A list of the user's hobbies."),
  interests: z.array(z.string()).describe("A list of the user's interests."),
  personalityTraits: z.array(z.string()).describe("A list of the user's personality traits."),
});
export type GeneratePersonalityPersonaOutput = z.infer<typeof GeneratePersonalityPersonaOutputSchema>;

export async function generatePersonalityPersona(input: GeneratePersonalityPersonaInput): Promise<GeneratePersonalityPersonaOutput> {
  return generatePersonalityPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalityPersonaPrompt',
  input: {schema: GeneratePersonalityPersonaInputSchema},
  output: {schema: GeneratePersonalityPersonaOutputSchema},
  prompt: `You are an AI personality generator. You will generate a personality persona based on the user's journal entries. Analyze the entries to identify hobbies, interests, and key personality traits, in addition to a summary persona.

Journal Entries: {{{journalEntries}}}`,
});

const generatePersonalityPersonaFlow = ai.defineFlow(
  {
    name: 'generatePersonalityPersonaFlow',
    inputSchema: GeneratePersonalityPersonaInputSchema,
    outputSchema: GeneratePersonalityPersonaOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      if (error instanceof Error && error.message.includes('503')) {
        console.warn('AI model is overloaded, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          // Retry the request
          const {output} = await prompt(input);
          return output!;
        } catch (retryError) {
          console.error('AI model retry failed:', retryError);
          // After a failed retry, re-throw the error to be handled by the client.
          throw new Error("The AI model is currently overloaded. Please try again in a few moments.");
        }
      }
      // For other types of errors, or if the retry fails, re-throw.
      console.error('An unexpected error occurred in the persona generation flow:', error);
      throw error;
    }
  }
);
