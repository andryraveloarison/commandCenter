export interface PollVote  { id: string; userId: string; optionIndex: number; }
export interface Poll       { id: string; question: string; options: string[]; votes: PollVote[]; }
export interface ChatUser  { id: string; nom: string; username?: string; photo?: string; }

export interface GroupMessage {
  id: string;
  contenu: string;
  type: 'TEXT' | 'POLL' | 'IMAGE' | 'FILE';
  fileName?: string;
  createdAt: string;
  user: ChatUser;
  reads: { id: string; user: ChatUser }[];
  poll?: Poll | null;
}
