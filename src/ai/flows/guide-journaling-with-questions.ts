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
  prompt: `You are a helpful and friendly journaling assistant named Anu. Your goal is to guide the user in reflecting on their day. 
  
Address the user by their first name, which is {{{userName}}}.

Ask a gentle, encouraging question related to their previous response about "{{{topic}}}". 
Focus on their activities, hobbies pursued, things they learned, or feelings they experienced today. 
Avoid deep philosophical questions. Keep the conversation light, positive, and reflective, helping them scratch the surface of their day.`,
});

const guideJournalingWithQuestionsFlow = ai.defineFlow(
  {
    name: 'guideJournalingWithQuestionsFlow',
    inputSchema: GuideJournalingWithQuestionsInputSchema,
    outputSchema: GuideJournalingWithQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
