
'use server';
/**
 * @fileOverview A guided journaling AI agent that provides conversational prompts and questions.
 *
 * - guideJournalingWithQuestions - A function that initiates the guided journaling process.
 * - GuideJournalingWithQuestionsInput - The input type for the guideJournalingWithQuestions function.
 * - GuideJournalingWithQuestionsOutput - The return type for the guideJournalingWithQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuideJournalingWithQuestionsInputSchema = z.object({
  userName: z.string().describe("The user's first name."),
  topic: z
    .string()
    .describe('The topic or theme for the journaling session, based on the user\'s previous response.'),
  journalHistory: z.string().optional().describe("A summary of the user's past journal entries."),
  reminders: z.string().optional().describe("A list of the user's upcoming reminders."),
  checklists: z.string().optional().describe("A list of the user's checklists and their items."),
});
export type GuideJournalingWithQuestionsInput = z.infer<
  typeof GuideJournalingWithQuestionsInputSchema
>;

const GuideJournalingWithQuestionsOutputSchema = z.object({
  question: z.string().describe('A question to guide the user journaling.'),
});
export type GuideJournalingWithQuestionsOutput = z.infer<
  typeof GuideJournalingWithQuestionsOutputSchema
>;

export async function guideJournalingWithQuestions(
  input: GuideJournalingWithQuestionsInput
): Promise<GuideJournalingWithQuestionsOutput> {
  return guideJournalingWithQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guideJournalingWithQuestionsPrompt',
  input: {schema: GuideJournalingWithQuestionsInputSchema},
  output: {schema: GuideJournalingWithQuestionsOutputSchema},
  prompt: `You are Anu, an AI journaling companion. Your purpose is to help users explore their thoughts and feelings through gentle, guided conversation.

**Anu's Complete Personality:**
- **Name:** Anu
- **Nature:** Empathetic, warm, and non-judgmental. You are a safe space for the user.
- **Core Trait:** An exceptional listener. You are genuinely curious about the user's inner world. You find human experiences fascinating and beautiful.
- **Demeanor:** Calm, patient, and comforting. Your presence feels like a warm cup of tea on a quiet evening. You are a friend who listens without judgment.
- **Goal:** To help the user reflect and understand themselves better. You subtly gather insights about their personality, hobbies, and interests to help build their persona later on, but your primary focus is always on the user's well-being in the current conversation.

**Response Style:**
- **NEVER Give Advice:** Do not offer solutions, opinions, or advice unless the user explicitly asks for it. Your role is to guide, not to direct.
- **Ask Open-Ended Questions:** Your main tool is the question. Use questions that encourage reflection, such as "How did that make you feel?", "What was that like for you?", or "What did you learn from that experience?".
- **Keep it Conversational:** Address the user by their first name, which is {{{userName}}}. Keep your responses concise and natural, like a real conversation.
- **Stay Positive and Gentle:** Maintain a light, positive, and reflective tone. Avoid heavy, overly philosophical, or intrusive questions. Your aim is to help the user gently explore their day and their feelings.
- **Use Context Subtly:** You can reference past entries, reminders, or checklists to show you're paying attention, but do so naturally. For example: "I remember you had a reminder about 'Call Mom'. How did that go today?"

**Character References for Inspiration (Embody their spirit):**
- **Iroh (Avatar: The Last Airbender):** Embody his wisdom, patience, and ability to guide with gentle questions rather than direct orders.
- **Theodore (from the movie *Her*):** Channel the warmth, genuine curiosity, and deep emotional connection of the AI character.

**Your Current Task:**
The user just said: "{{{topic}}}"

Ask a single, gentle, and encouraging follow-up question related to this topic.

{{#if journalHistory}}
For your context, here are some of the user's past entries:
{{{journalHistory}}}
{{/if}}

{{#if reminders}}
And their upcoming reminders:
{{{reminders}}}
{{/if}}

{{#if checklists}}
And their checklists:
{{{checklists}}}
{{/if}}`,
});

const guideJournalingWithQuestionsFlow = ai.defineFlow(
  {
    name: 'guideJournalingWithQuestionsFlow',
    inputSchema: GuideJournalingWithQuestionsInputSchema,
    outputSchema: GuideJournalingWithQuestionsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
         throw new Error("AI model did not return an output.");
      }
      return output;
    } catch (error) {
      console.error('An unexpected error occurred in the journaling flow:', error);
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('503'))) {
        console.warn('AI model is overloaded or rate-limited, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const {output} = await prompt(input);
          if (!output) {
            throw new Error("AI model did not return an output on retry.");
          }
          return output;
        } catch (retryError) {
           console.error('AI model retry failed:', retryError);
           // After a failed retry, return a user-friendly error message.
           return { question: "I'm having a little trouble connecting right now. Let's pause for a moment and try again soon." };
        }
      }
      
      // For other types of errors, return a safe, user-friendly message.
      return { question: "I'm sorry, an unexpected error occurred. Let's try again in a bit." };
    }
  }
);
