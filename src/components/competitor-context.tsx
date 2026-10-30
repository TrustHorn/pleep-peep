"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type Account = {
  id: string;
  name: string;
  handle: string;
  platform: "TikTok" | "Instagram";
  followers: number | null;
  videos: number | null;
  views: number | null;
  interactions: number | null;
  growth: number | null;
  initials: string;
  color: string;
  category: string;
};

export const initialAccounts: Account[] = [
  { id: "1", name: "Slow Club", handle: "slowclub.coffee", platform: "Instagram", followers: 38200, videos: 28, views: 486000, interactions: 34800, growth: 18.6, initials: "sc", color: "bg-[#eee7da] text-[#6b5944]", category: "Спешелти-кофейня" },
  { id: "2", name: "Daily Brew", handle: "daily.brew", platform: "TikTok", followers: 24600, videos: 35, views: 624000, interactions: 51168, growth: 24.8, initials: "db", color: "bg-[#e3e9df] text-[#4b6044]", category: "Кофе и повседневность" },
  { id: "3", name: "Bean & Co.", handle: "bean.and.co", platform: "Instagram", followers: 51400, videos: 21, views: 382000, interactions: 23200, growth: 12.4, initials: "b.", color: "bg-[#f7e5dd] text-[#a56249]", category: "Обжарочная и кофейня" },
  { id: "4", name: "Drip Stories", handle: "drip.stories", platform: "TikTok", followers: 18200, videos: 25, views: 268000, interactions: 18500, growth: 9.2, initials: "ds", color: "bg-[#e3e9e9] text-[#526b6a]", category: "Кофейная культура" },
  { id: "5", name: "Mood Espresso", handle: "mood.espresso", platform: "Instagram", followers: 12900, videos: 18, views: 152000, interactions: 8400, growth: 6.9, initials: "m", color: "bg-[#f4edda] text-[#8f793e]", category: "Городская кофейня" },
];

type AccountsState = [Account[], Dispatch<SetStateAction<Account[]>>];
const CompetitorContext = createContext<AccountsState | null>(null);

export function CompetitorProvider({ children }: { children: ReactNode }) {
  const state = useState<Account[]>(initialAccounts);
  return <CompetitorContext.Provider value={state}>{children}</CompetitorContext.Provider>;
}

export function useCompetitorAccounts(): AccountsState {
  const state = useContext(CompetitorContext);
  if (!state) throw new Error("useCompetitorAccounts must be used inside CompetitorProvider");
  return state;
}
