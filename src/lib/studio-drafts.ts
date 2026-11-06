"use client";

import { useEffect } from "react";
import { useAuth, useUserState } from "@/components/auth-context";
import { writeBrowserValue } from "@/lib/browser-storage";

export type Brief = {
  topic: string;
  audience: string;
  platform: "Instagram" | "TikTok";
  duration: "15" | "30" | "60";
  tone: string;
  hashtags: string;
};

export type Scene = { time: string; title: string; visual: string; voice: string };
export type Idea = {
  title: string;
  format: string;
  angle: string;
  hook: string;
  scenes: Scene[];
  cta: string;
  description: string;
  hashtags: string;
};

export type Draft = { id: string; savedAt: string; brief: Brief; ideas: Idea[]; selected: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIdea(value: unknown): value is Idea {
  if (!isRecord(value)) return false;
  return ["title", "format", "angle", "hook", "cta", "description", "hashtags"].every((field) => typeof value[field] === "string")
    && Array.isArray(value.scenes) && value.scenes.length > 0
    && value.scenes.every((scene: unknown) => isRecord(scene) && ["time", "title", "visual", "voice"].every((field) => typeof scene[field] === "string"));
}

function validDrafts(value: unknown): Draft[] {
  if (!Array.isArray(value)) return [];
  return value.filter((draft: unknown): draft is Draft => {
    if (!isRecord(draft) || !isRecord(draft.brief)) return false;
    const brief = draft.brief;
    return typeof draft.id === "string" && typeof draft.savedAt === "string"
      && typeof draft.selected === "number" && Number.isInteger(draft.selected)
      && Array.isArray(draft.ideas) && draft.ideas.length > 0 && draft.ideas.every(isIdea)
      && draft.selected >= 0 && draft.selected < draft.ideas.length
      && ["topic", "audience", "tone", "hashtags"].every((key) => typeof brief[key] === "string")
      && (brief.platform === "Instagram" || brief.platform === "TikTok")
      && ["15", "30", "60"].includes(String(brief.duration));
  });
}

export function useStudioDrafts() {
  const { user, ready } = useAuth();
  const [storedDrafts, setDrafts] = useUserState<Draft[]>("studio-drafts", []);

  useEffect(() => {
    if (!ready || user) return;
    try {
      // Legacy drafts belong to the shared demo workspace, never to a newly created account.
      if (localStorage.getItem("pleep-peep:v1:user:demo:studio-drafts") !== null) return;
      const legacy = localStorage.getItem("pleep-peep:studio-drafts:v1");
      if (legacy) writeBrowserValue("user:demo:studio-drafts", validDrafts(JSON.parse(legacy)));
    } catch {
      // A malformed legacy entry must not prevent opening either studio.
    }
  }, [ready, user]);

  return [validDrafts(storedDrafts), setDrafts] as const;
}
