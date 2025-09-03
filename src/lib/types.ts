export type User = {
  id: string;
  name: string;
  avatar: string;
  persona?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  journalEntries?: string[];
};

export type Connection = {
  id: string;
  userId: string;
  status: 'pending' | 'accepted';
};

export type Message = {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}
