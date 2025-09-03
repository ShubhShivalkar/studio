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
  topic: z
    .string()
    .describe('The topic or theme for the journaling session.'),
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
  prompt: `You are a helpful journaling assistant. Your goal is to guide the user in reflecting on their thoughts and experiences related to the topic: {{{topic}}}. Ask a thought-provoking question to encourage them to write about it.`,
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
