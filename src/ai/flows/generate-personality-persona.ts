
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
  mbti: z.string().describe("The user's estimated MBTI personality type (e.g., INFP, ESTJ)."),
});
export type GeneratePersonalityPersonaOutput = z.infer<typeof GeneratePersonalityPersonaOutputSchema>;

export async function generatePersonalityPersona(input: GeneratePersonalityPersonaInput): Promise<GeneratePersonalityPersonaOutput> {
  return generatePersonalityPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalityPersonaPrompt',
  input: {schema: GeneratePersonalityPersonaInputSchema},
  output: {schema: GeneratePersonalityPersonaOutputSchema},
  prompt: `You are an AI personality generator. Your task is to generate a detailed personality persona based on a user's journal entries. Analyze the entries to identify hobbies, interests, and key personality traits, and create a summary persona.

**Crucially, you must also make an educated guess about the user's MBTI personality type (e.g., INFP, ESTJ).** To do this, analyze their writing through the lens of the following personality dichotomies. Look for patterns in their thoughts, behaviors, and feelings that align with these descriptions.

---
**MBTI Analysis Framework:**

**1. Extrovert (E) vs. Introvert (I) - How they direct their energy**
*   **(E) Extrovert:** Do they seem energized by social gatherings, group interactions, and brainstorming with others? Do their entries often talk about going out, meeting friends, and seeking social events?
*   **(I) Introvert:** Do they seem to recharge with alone time? Do their entries focus on one-on-one conversations, quieter activities at home, or independent work? Do they find small talk draining?

**2. Sensing (S) vs. Intuition (N) - How they perceive information**
*   **(S) Sensing:** Do they focus on concrete facts, details, and practical, hands-on experiences? Are their plans detailed and their problem-solving methodical and based on past experiences? Do they talk about what is, rather than what could be?
*   **(N) Intuition:** Do they explore possibilities, theories, and potential meanings? Are they more focused on the overall vision and future patterns? Do they enjoy spontaneity and look for deeper meanings or symbolism in events?

**3. Thinking (T) vs. Feeling (F) - How they make decisions**
*   **(T) Thinking:** Do they prioritize logical analysis, objective criteria, and efficiency? Is their feedback direct and constructive? Do they solve problems with reason and strategy, even if it means being blunt?
*   **(F) Feeling:** Do they consider the impact on people, relationships, and personal values? Do they prioritize harmony and empathy? Do they handle criticism by considering emotional aspects and seek emotional support?

**4. Judging (J) vs. Perceiving (P) - Their approach to the outer world**
*   **(J) Judging:** Do they enjoy making plans and sticking to a structured schedule? Do they work diligently to meet deadlines and prefer an organized environment? Do they like reaching conclusions and moving on?
*   **(P) Perceiving:** Do they prefer flexibility, spontaneity, and dislike strict schedules? Do they work well under pressure near deadlines and enjoy exploring possibilities as they go? Do they prefer to keep options open?
---

Based on your analysis of the journal entries using this framework, provide the persona, traits, and the estimated MBTI type.

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
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('503'))) {
        console.warn('AI model is overloaded or rate-limited, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          // Retry the request
          const {output} = await prompt(input);
          return output!;
        } catch (retryError) {
          console.error('AI model retry failed:', retryError);
          // After a failed retry, return a default empty state instead of throwing.
          return { persona: "Could not generate persona at this time.", hobbies: [], interests: [], personalityTraits: [], mbti: "N/A" };
        }
      }
      // For other types of errors, or if the retry fails, re-throw.
      console.error('An unexpected error occurred in the persona generation flow:', error);
      // Also return a default state for other unexpected errors.
      return { persona: "An unexpected error occurred. Please try again later.", hobbies: [], interests: [], personalityTraits: [], mbti: "N/A" };
    }
  }
);
