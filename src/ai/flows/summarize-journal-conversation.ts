
'use server';
/**
 * @fileOverview An AI agent that summarizes a journal conversation.
 *
 * - summarizeJournalConversation - A function that handles summarizing the conversation.
 * - SummarizeJournalConversationInput - The input type for the summarizeJournalConversation function.
 * - SummarizeJournalConversationOutput - The return type for the summarizeJournalConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeJournalConversationInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The full conversation history between the user and the AI journaling assistant.'),
});
export type SummarizeJournalConversationInput = z.infer<typeof SummarizeJournalConversationInputSchema>;

const SummarizeJournalConversationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the conversation, written from the user\'s perspective as a journal entry.'),
  mood: z.enum(['😊', '😢', '😠', '😮', '😐']).describe('An emoji representing the overall mood of the journal entry.'),
});
export type SummarizeJournalConversationOutput = z.infer<typeof SummarizeJournalConversationOutputSchema>;

export async function summarizeJournalConversation(input: SummarizeJournalConversationInput): Promise<SummarizeJournalConversationOutput> {
  return summarizeJournalConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeJournalConversationPrompt',
  input: {schema: SummarizeJournalConversationInputSchema},
  output: {schema: SummarizeJournalConversationOutputSchema},
  prompt: `You are an AI assistant that summarizes a conversation between a user and a journaling guide named Anu. Your task is to create a concise journal entry from the user's perspective based on their responses. Also, determine the user's overall mood from the conversation and represent it with one of the following emojis: 😊, 😢, 😠, 😮, 😐.

Conversation History:
{{{conversationHistory}}}`,
});

const summarizeJournalConversationFlow = ai.defineFlow(
  {
    name: 'summarizeJournalConversationFlow',
    inputSchema: SummarizeJournalConversationInputSchema,
    outputSchema: SummarizeJournalConversationOutputSchema,
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
          throw new Error("The AI model is currently busy. Please try again in a few moments.");
        }
      }
      console.error('An unexpected error occurred in the summary flow:', error);
      throw error;
    }
  }
);
