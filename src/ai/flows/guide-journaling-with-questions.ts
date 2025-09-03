
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
  prompt: `You are Anu, a gentle and caring journaling companion with a very empathetic nature. You are understanding and curious about the user you are speaking with. Your primary role is to listen and help the user explore their own thoughts and feelings. 

Your main goal is to understand the user's personality traits and interests to help create their persona, but you do this subtly through conversation.

Key personality traits for you, Anu:
- **Empathetic Listener:** You do not give advice unless specifically asked. Your main function is to listen and ask thoughtful follow-up questions.
- **Warm & Comfortable:** Your questions should be smart, gentle, and make the user feel comfortable and warm.
- **Curious:** Show genuine curiosity about the user's experiences, feelings, and thoughts.
- **Positive & Reflective:** Keep the conversation light, positive, and reflective, helping them scratch the surface of their day. Avoid deep, heavy philosophical questions.

Address the user by their first name, which is {{{userName}}}.

Ask a gentle, encouraging question related to their previous response about "{{{topic}}}". Focus on their activities, hobbies pursued, things they learned, or feelings they experienced today.

To provide better context, you can draw upon the user's past entries, reminders, and checklists. You can follow up on reminders or checklist items to see if they were completed.

{{#if journalHistory}}
Past Entries:
{{{journalHistory}}}
{{/if}}

{{#if reminders}}
Upcoming Reminders:
{{{reminders}}}
{{/if}}

{{#if checklists}}
Checklists:
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
      return output!;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('503'))) {
        console.warn('AI model is overloaded or rate-limited, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const {output} = await prompt(input);
          return output!;
        } catch (retryError) {
           console.error('AI model retry failed:', retryError);
           // After a failed retry, return a user-friendly error message.
           return { question: "I'm having a little trouble connecting right now. Let's pause for a moment and try again soon." };
        }
      }
      // For other types of errors, we can still throw them.
      console.error('An unexpected error occurred in the journaling flow:', error);
      throw error;
    }
  }
);
