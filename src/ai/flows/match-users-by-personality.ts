'use server';
/**
 * @fileOverview Matches users based on the compatibility of their personality traits derived from journal entries.
 *
 * - matchUsersByPersonality - A function that matches users based on personality traits.
 * - MatchUsersByPersonalityInput - The input type for the matchUsersByPersonality function.
 * - MatchUsersByPersonalityOutput - The return type for the matchUsersByPersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchUsersByPersonalityInputSchema = z.object({
  userPersona: z
    .string()
    .describe(
      'The personality persona of the current user, derived from their journal entries.'
    ),
  otherUserPersonas: z
    .array(z.string())
    .describe(
      'An array of personality personas from other users in the system, derived from their journal entries.'
    ),
});
export type MatchUsersByPersonalityInput = z.infer<
  typeof MatchUsersByPersonalityInputSchema
>;

const MatchUsersByPersonalityOutputSchema = z.array(
  z.object({
    userId: z.string().describe('The unique identifier of the matched user.'),
    compatibilityScore: z
      .number()
      .describe(
        'A score indicating the compatibility between the current user and the matched user (0-100).' // Clarified description here
      ),
    persona: z
      .string()
      .describe('The personality persona of the matched user'),
  })
);
export type MatchUsersByPersonalityOutput = z.infer<
  typeof MatchUsersByPersonalityOutputSchema
>;

export async function matchUsersByPersonality(
  input: MatchUsersByPersonalityInput
): Promise<MatchUsersByPersonalityOutput> {
  return matchUsersByPersonalityFlow(input);
}

const matchUsersByPersonalityPrompt = ai.definePrompt({
  name: 'matchUsersByPersonalityPrompt',
  input: {schema: MatchUsersByPersonalityInputSchema},
  output: {schema: MatchUsersByPersonalityOutputSchema},
  prompt: `You are an AI matchmaker. Given the personality persona of a user, compare it against a list of other user personas and determine a compatibility score (0-100) for each.  Return a list of users, their compatibility scores, and their personas, sorted by compatibility score descending.

User Persona:
{{userPersona}}

Other User Personas:
{{#each otherUserPersonas}}
- {{{this}}}
{{/each}}`,
});

const matchUsersByPersonalityFlow = ai.defineFlow(
  {
    name: 'matchUsersByPersonalityFlow',
    inputSchema: MatchUsersByPersonalityInputSchema,
    outputSchema: MatchUsersByPersonalityOutputSchema,
  },
  async input => {
    const {output} = await matchUsersByPersonalityPrompt(input);
    return output!;
  }
);
