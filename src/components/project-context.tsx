"use client";

import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useUserState } from "./auth-context";
import { demoProjects, type Project } from "@/lib/demo-data";

type ProjectsState = [Project[], Dispatch<SetStateAction<Project[]>>];
const ProjectContext = createContext<ProjectsState | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const state = useUserState<Project[]>("projects", demoProjects);
  return <ProjectContext.Provider value={state}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectsState {
  const state = useContext(ProjectContext);
  if (!state) throw new Error("useProjects must be used inside ProjectProvider");
  return state;
}
