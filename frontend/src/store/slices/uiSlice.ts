import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'military' | 'dark' | 'light';
  notifications: any[];
  modal: { isOpen: boolean; type: string; data: any } | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'military',
  notifications: [],
  modal: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'military' | 'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
    setModal: (state, action: PayloadAction<UIState['modal']>) => {
      state.modal = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, addNotification, removeNotification, setModal } = uiSlice.actions;
export default uiSlice.reducer;
