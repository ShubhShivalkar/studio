
'use server';
/**
 * @fileOverview Matches users for a tribe based on personality and specific preferences.
 *
 * - matchUsersByTribePreferences - A function that matches users for a tribe.
 * - MatchUsersByTribePreferencesInput - The input type for the matchUsersByTribePreferences function.
 * - MatchUsersByTribePreferencesOutput - The return type for the matchUsersByTribePreferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { differenceInYears, parseISO } from 'date-fns';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  persona: z.string().optional(),
  dob: z.string(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  interestedInMeetups: z.boolean().optional(),
});

const MatchUsersByTribePreferencesInputSchema = z.object({
  currentUser: UserSchema,
  otherUsers: z.array(UserSchema),
  preferences: z.object({
    ageRange: z.tuple([z.number(), z.number()]),
    gender: z.enum(['No Preference', 'Same Gender', 'Mixed Gender']),
  }),
});
export type MatchUsersByTribePreferencesInput = z.infer<typeof MatchUsersByTribePreferencesInputSchema>;

const MatchedUserSchema = z.object({
    userId: z.string().describe('The unique identifier of the matched user.'),
    compatibilityScore: z.number().describe('A score indicating the compatibility between the current user and the matched user (0-100).'),
    persona: z.string().describe('The personality persona of the matched user'),
    matchReason: z.string().describe('A brief explanation of why these users are a good match.'),
});

const MatchUsersByTribePreferencesOutputSchema = z.array(MatchedUserSchema);

export type MatchUsersByTribePreferencesOutput = z.infer<typeof MatchUsersByTribePreferencesOutputSchema>;

export async function matchUsersByTribePreferences(
  input: MatchUsersByTribePreferencesInput
): Promise<MatchUsersByTribePreferencesOutput> {
  // Pre-filter users based on preferences before sending to the AI model.
  const { currentUser, otherUsers, preferences } = input;
  const currentUserAge = differenceInYears(new Date(), parseISO(currentUser.dob));

  const filteredUsers = otherUsers.filter(user => {
    // Exclude the current user from the list of potential matches
    if (user.id === currentUser.id) return false;
    
    // Must be interested in meetups
    if (!user.interestedInMeetups) return false;

    // Filter by age range
    const userAge = differenceInYears(new Date(), parseISO(user.dob));
    if (userAge < preferences.ageRange[0] || userAge > preferences.ageRange[1]) {
      return false;
    }
    
    // Filter by gender preference
    if (preferences.gender === 'Same Gender' && user.gender !== currentUser.gender) {
        return false;
    }

    return true;
  });
  
  const otherUserPersonas = filteredUsers.map(user => `${user.id}::${user.persona || 'No persona available.'}`);

  const modelInput = {
    userPersona: `${currentUser.id}::${currentUser.persona}`,
    otherUserPersonas,
    genderPreference: preferences.gender,
  };
  
  return matchUsersByTribePreferencesFlow(modelInput);
}


const flowInputSchema = z.object({
    userPersona: z.string(),
    otherUserPersonas: z.array(z.string()),
    genderPreference: z.string(),
});

const matchUsersByTribePreferencesPrompt = ai.definePrompt({
  name: 'matchUsersByTribePreferencesPrompt',
  input: {schema: flowInputSchema },
  output: {schema: MatchUsersByTribePreferencesOutputSchema},
  prompt: `You are an AI matchmaker specializing in forming small, compatible groups (tribes) of 4 people.
Given the current user's persona, compare it against a list of other user personas to find the 3 best matches.
Each persona in the list is prefixed with "userId::". Ensure you extract the userId correctly.

Current User Persona:
{{userPersona}}

Available User Personas (Format: "userId::persona"):
{{#each otherUserPersonas}}
- {{{this}}}
{{/each}}

User's Gender Preference: {{genderPreference}}

CRITERIA FOR MATCHING:
1.  **Compatibility First:** Find the 3 most compatible users based on their personas. Aim for a mix of similarities for comfort and differences for interesting conversations.
2.  **Gender Preference:**
    - If the preference is 'Mixed Gender', you MUST select a group that results in a 1:1 gender ratio (2 men, 2 women). Do your best to meet this. If not possible, create the most balanced group you can.
    - If the preference is 'Same Gender' or 'No Preference', gender balance is not a primary concern; focus on the best personality matches.
3.  **Output:** Return a list of the top 3 matched users, including their userId, a compatibility score (0-100), their persona, and a brief, insightful reason for why they are a good match for the current user.`,
});

const matchUsersByTribePreferencesFlow = ai.defineFlow(
  {
    name: 'matchUsersByTribePreferencesFlow',
    inputSchema: flowInputSchema,
    outputSchema: MatchUsersByTribePreferencesOutputSchema,
  },
  async (input) => {
     try {
      const {output} = await matchUsersByTribePreferencesPrompt(input);
      // Ensure we only return up to 3 matches
      return output!.slice(0, 3);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('503'))) {
        console.warn('AI model is overloaded or rate-limited, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const {output} = await matchUsersByTribePreferencesPrompt(input);
          return output!.slice(0, 3);
        } catch (retryError) {
          console.error('AI model retry failed:', retryError);
          return [];
        }
      }
      console.error('An unexpected error occurred in the matching flow:', error);
      return [];
    }
  }
);
