# anuvaad - Product Documentation

## 1. Overview

**anuvaad**, is a mobile-first web application designed to help users form meaningful connections based on deep personality insights. The core mission is to "translate experiences into real, meaningful connections" by moving beyond superficial profiles and focusing on genuine compatibility derived from self-reflection.

The application leverages an AI-powered journaling companion, Anu, to guide users through introspection. The insights gathered from these journal entries are then used to generate a personality persona, which becomes the foundation for matching users into small, compatible groups called "Tribes."

---

## 2. Core Features

### 2.1. User Onboarding & Authentication

-   **Description**: A simple, multi-step process to register new users or log in existing ones.
-   **Functionality**:
    1.  **Phone Number Entry**: The user enters their phone number.
    2.  **Authentication Logic**: The system checks if the phone number exists in the user database (`allUsers` in mock data).
        -   If **user exists**, they are considered "logged in," and the application loads their existing data.
        -   If **user is new**, they proceed through the full onboarding flow.
    3.  **Onboarding Steps**: New users provide their full name, date of birth, gender, and an optional profile picture.
    4.  **Profile Creation**: Upon completion, a new user profile is created and saved.

### 2.2. AI-Guided Journaling (`Journal` Page)

-   **Description**: A conversational chat interface where the user interacts with "Anu," an empathetic AI journaling companion.
-   **Functionality**:
    -   Anu initiates the conversation and asks gentle, guiding questions based on the user's responses.
    -   The conversation is designed to be light, positive, and reflective, helping the user explore their thoughts and feelings about their day.
    -   After a predefined number of interactions (**10 AI questions**), the conversation concludes, and a summary is generated.
-   **Algorithm (`guideJournalingWithQuestions` Flow)**:
    -   This Genkit AI flow takes the user's most recent message as the `topic`.
    -   It also considers contextual information like the user's name, past journal entries, reminders, and checklists.
    -   The AI prompt instructs Anu to be empathetic, curious, and avoid giving advice, ensuring the conversation remains a guided self-reflection.
    -   The output is a single, thoughtful follow-up question.

### 2.3. Journal Conversation Summary & Daily Entry (`Calendar` Page)

-   **Description**: At the end of a journaling session, the conversation is automatically summarized and saved as a daily entry.
-   **Functionality**:
    -   The summary is written from the user's perspective (first-person).
    -   An emoji representing the overall mood of the conversation is also determined.
    -   This summary and mood are saved and associated with the current date, visible on the Calendar page.
-   **Algorithm (`summarizeJournalConversation` Flow)**:
    -   This Genkit AI flow receives the entire conversation history as a single string.
    -   The AI is prompted to act as an assistant that reads the conversation and creates a concise journal entry from the user's point of view.
    -   It also analyzes the user's responses to determine a mood, selecting from a predefined list of emojis (`😊`, `😢`, `😠`, `😮`, `😐`).
    -   The output is a JSON object containing the `summary` string and the `mood` emoji.

### 2.4. Persona Generation (`Profile` Page)

-   **Description**: The AI analyzes a user's journal entries to create a detailed personality persona.
-   **Condition**: This feature is only available after the user has accumulated **at least 15 journal entries**. This ensures the AI has sufficient data to create a meaningful and accurate persona. A progress bar is shown until this threshold is met.
-   **Functionality**:
    -   When the user clicks "Generate Persona," all their journal entries are concatenated and sent to the AI.
    -   The generated persona includes a narrative summary, a list of personality traits, hobbies, and interests.
    -   This persona is displayed on the user's profile and becomes the basis for tribe matching.
    -   Users can regenerate their persona, but not more than once every **7 days**.
-   **Algorithm (`generatePersonalityPersona` Flow)**:
    -   This Genkit AI flow takes the combined text of all journal entries.
    -   The AI is prompted to analyze the text to identify recurring themes, activities, and emotional tones.
    -   It then structures this analysis into a detailed summary, and extracts lists of hobbies, interests, and personality traits.
    -   The output is a JSON object containing the `persona` summary and arrays for `hobbies`, `interests`, and `personalityTraits`.

### 2.5. Tribe Matching (`Tribe` Page)

-   **Description**: The primary social feature where users are matched into small, compatible groups ("Tribes") for potential weekend meetups.
-   **Functionality**:
    -   The system attempts to automatically form a tribe for the user.
    -   If successful, a tribe of 4 members (the user + 3 matches) is presented with a proposed meetup date, time, and location.
    -   Users can RSVP ('Accept' or 'Decline') for the meetup.
    -   Declining an invitation requires a reason and prevents the user from joining another tribe until the next matchmaking cycle.
-   **Conditions for Automatic Matching**:
    1.  The user must have a **generated persona**.
    2.  The user must have opted-in by toggling **"Interested in meeting new people"** on their profile.
    3.  The user must have marked themselves as **available for a meetup** on an upcoming weekend day in their Calendar.
-   **Algorithm (`matchUsersByTribePreferences` Flow)**:
    1.  **Pre-filtering**: Before calling the AI, the system filters the pool of all users based on the current user's preferences (age range, gender) and availability. Only users who are interested in meetups are considered.
    2.  **AI Matching**: The Genkit AI flow receives the current user's persona and a list of filtered candidate personas.
    3.  **Prompt Logic**: The AI is instructed to act as a matchmaker, finding the 3 best matches to form a tribe of 4. It considers personality compatibility (aiming for a mix of similarities and differences) and gender balance if a "Mixed Gender" preference is set.
    4.  **Output**: The flow returns an array of the top 3 matched users, each with a `userId`, a `compatibilityScore` (0-100), their `persona`, and a `matchReason`.

### 2.6. Tribe Discovery (`Tribe/Discover` Page)

-   **Description**: Allows users to proactively find and join existing tribes that are not yet full.
-   **Functionality**:
    -   Displays a list of discoverable tribes with key information: member count, compatibility score, gender composition (represented by symbols), and the most common location of its members.
    -   Users can filter tribes by status (Complete/Partial), category (Male/Female/Mixed), and location.
    -   Users can sort tribes by compatibility score or number of members.
    -   Clicking "Join Tribe" prompts for confirmation. Upon confirming, the user is added to the tribe, and their Tribe page updates to show the new tribe's details.
-   **Conditions for Visibility**: The "Discover" button on the main Tribe page is only visible if:
    -   The user has a generated persona.
    -   The user has opted-in to meetups.
    -   The user has **not** already declined an RSVP for the current week's tribe invitation.

### 2.7. Calendar & Organization

-   **Description**: A comprehensive calendar view that serves as a hub for daily summaries, reminders, and checklists.
-   **Functionality**:
    -   **Calendar View**: Displays a full month. Days with journal entries, reminders, or checklists are marked with small icons.
    -   **Daily Details**: Clicking a date opens a sheet displaying the journal summary, mood, reminders, and checklists for that day.
    -   **Weekend Availability**: On weekend days, users can toggle their availability for tribe meetups.
    -   **Event Management**: Users can create, view, and delete reminders and checklists from dedicated pages (`/reminders`, `/checklist`), and these items appear on the relevant day in the calendar.

---

## 3. Technical Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **Generative AI**: Google AI via Genkit
-   **State Management**: Zustand (for onboarding and tribe state)
-   **Icons**: Lucide React

---
## 4. Footnotes

An Anubhav Social's product
