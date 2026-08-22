import { create } from "zustand";

interface ActiveSpeaker {
  identity: string;
  name?: string;
}

interface PttState {
  token: string | null;
  serverUrl: string | null;
  isMuted: boolean;
  activeSpeakers: ActiveSpeaker[];
  setToken: (token: string, serverUrl: string) => void;
  toggleMute: () => void;
  setActiveSpeakers: (speakers: ActiveSpeaker[]) => void;
}

export const usePttStore = create<PttState>((set) => ({
  token: null,
  serverUrl: null,
  isMuted: false, // Default to listening
  activeSpeakers: [],
  setToken: (token, serverUrl) => set({ token, serverUrl }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setActiveSpeakers: (speakers) => set({ activeSpeakers: speakers }),
}));
