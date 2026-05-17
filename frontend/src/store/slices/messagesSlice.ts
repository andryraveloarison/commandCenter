import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface MsgUser {
  id: string; nom: string; username?: string; photo?: string;
}

export interface Conversation {
  partner: MsgUser;
  lastMessage: { contenu: string; createdAt: string; senderId: string };
  unread: number;
}

export interface GroupMessage {
  id: string; contenu: string; createdAt: string; type?: string;
  user: MsgUser;
  reads?: { user: MsgUser }[];
  poll?: any;
}

export interface DmMessage {
  id: string; contenu: string; createdAt: string; lu: boolean;
  sender: MsgUser;
}

interface ConvCache {
  items: DmMessage[];
  hasMore: boolean;
  loadingMore: boolean;
}

interface MessagesState {
  group: {
    items: GroupMessage[];
    hasMore: boolean;
    loadingMore: boolean;
  };
  dm: Record<string, ConvCache>;
  conversations: Conversation[];
}

const initialState: MessagesState = {
  group: { items: [], hasMore: false, loadingMore: false },
  dm: {},
  conversations: [],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    /* ── Group ─────────────────────────────────────────────── */
    setGroupMessages(state, action: PayloadAction<{ items: GroupMessage[]; hasMore: boolean }>) {
      state.group.items = action.payload.items;
      state.group.hasMore = action.payload.hasMore;
      state.group.loadingMore = false;
    },
    prependGroupMessages(state, action: PayloadAction<{ items: GroupMessage[]; hasMore: boolean }>) {
      const existing = new Set(state.group.items.map(m => m.id));
      const fresh = action.payload.items.filter(m => !existing.has(m.id));
      state.group.items = [...fresh, ...state.group.items];
      state.group.hasMore = action.payload.hasMore;
      state.group.loadingMore = false;
    },
    setGroupLoadingMore(state, action: PayloadAction<boolean>) {
      state.group.loadingMore = action.payload;
    },
    addGroupMessage(state, action: PayloadAction<GroupMessage>) {
      if (!state.group.items.find(m => m.id === action.payload.id)) {
        state.group.items.push(action.payload);
      }
    },
    updateGroupReads(state, action: PayloadAction<{ user: MsgUser }>) {
      const { user } = action.payload;
      for (const msg of state.group.items) {
        if (!msg.reads) msg.reads = [];
        if (!msg.reads.some(r => r.user.id === user.id)) {
          msg.reads.push({ user });
        }
      }
    },
    updateGroupPoll(state, action: PayloadAction<any>) {
      const poll = action.payload;
      const msg = state.group.items.find(m => m.poll?.id === poll.id);
      if (msg) msg.poll = poll;
    },

    /* ── DM ────────────────────────────────────────────────── */
    setDmMessages(state, action: PayloadAction<{ partnerId: string; items: DmMessage[]; hasMore: boolean }>) {
      const { partnerId, items, hasMore } = action.payload;
      state.dm[partnerId] = { items, hasMore, loadingMore: false };
    },
    prependDmMessages(state, action: PayloadAction<{ partnerId: string; items: DmMessage[]; hasMore: boolean }>) {
      const { partnerId, items, hasMore } = action.payload;
      if (!state.dm[partnerId]) state.dm[partnerId] = { items: [], hasMore: false, loadingMore: false };
      const existing = new Set(state.dm[partnerId].items.map(m => m.id));
      const fresh = items.filter(m => !existing.has(m.id));
      state.dm[partnerId].items = [...fresh, ...state.dm[partnerId].items];
      state.dm[partnerId].hasMore = hasMore;
      state.dm[partnerId].loadingMore = false;
    },
    setDmLoadingMore(state, action: PayloadAction<{ partnerId: string; loading: boolean }>) {
      const { partnerId, loading } = action.payload;
      if (!state.dm[partnerId]) state.dm[partnerId] = { items: [], hasMore: false, loadingMore: false };
      state.dm[partnerId].loadingMore = loading;
    },
    addDmMessage(state, action: PayloadAction<{ partnerId: string; item: DmMessage }>) {
      const { partnerId, item } = action.payload;
      if (!state.dm[partnerId]) state.dm[partnerId] = { items: [], hasMore: false, loadingMore: false };
      if (!state.dm[partnerId].items.find(m => m.id === item.id)) {
        state.dm[partnerId].items.push(item);
      }
    },
    markDmRead(state, action: PayloadAction<string>) {
      const partnerId = action.payload;
      if (state.dm[partnerId]) {
        for (const m of state.dm[partnerId].items) m.lu = true;
      }
    },

    /* ── Conversations list ────────────────────────────────── */
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },
    upsertConversation(state, action: PayloadAction<Conversation>) {
      const idx = state.conversations.findIndex(c => c.partner.id === action.payload.partner.id);
      if (idx >= 0) state.conversations[idx] = action.payload;
      else state.conversations.unshift(action.payload);
    },
    clearConversationUnread(state, action: PayloadAction<string>) {
      const conv = state.conversations.find(c => c.partner.id === action.payload);
      if (conv) conv.unread = 0;
    },
  },
});

export const {
  setGroupMessages, prependGroupMessages, setGroupLoadingMore,
  addGroupMessage, updateGroupReads, updateGroupPoll,
  setDmMessages, prependDmMessages, setDmLoadingMore,
  addDmMessage, markDmRead,
  setConversations, upsertConversation, clearConversationUnread,
} = messagesSlice.actions;

export default messagesSlice.reducer;
