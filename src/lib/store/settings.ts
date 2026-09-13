import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  botToken: string;
  chatId: string;
  autoSend: boolean;
  minScore: number;
  accountUsd: number;
  riskPct: number;
  sentKeys: string[];
  setBotToken: (v: string) => void;
  setChatId: (v: string) => void;
  setAutoSend: (v: boolean) => void;
  setMinScore: (v: number) => void;
  setAccountUsd: (v: number) => void;
  setRiskPct: (v: number) => void;
  markSent: (keys: string[]) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      botToken: "",
      chatId: "",
      autoSend: false,
      minScore: 65,
      accountUsd: 10_000,
      riskPct: 1,
      sentKeys: [],
      setBotToken: (botToken) => set({ botToken }),
      setChatId: (chatId) => set({ chatId }),
      setAutoSend: (autoSend) => set({ autoSend }),
      setMinScore: (minScore) => set({ minScore }),
      setAccountUsd: (accountUsd) => set({ accountUsd }),
      setRiskPct: (riskPct) => set({ riskPct }),
      markSent: (keys) =>
        set({ sentKeys: [...get().sentKeys, ...keys].slice(-400) }),
    }),
    { name: "polaris-settings" },
  ),
);
