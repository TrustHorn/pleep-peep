"use client";

import { useCallback, useMemo, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";

const PREFIX = "pleep-peep:v1:";
const CHANGE_EVENT = "pleep-peep:storage-change";
const memory = new Map<string, string>();
let storageError = "";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
}

function parse<T>(raw: string | null, initial: T): T {
  if (raw === null) return initial;
  try {
    const value: unknown = JSON.parse(raw);
    // Discard malformed roots instead of crashing the whole workspace.
    if (Array.isArray(initial) && !Array.isArray(value)) return initial;
    if (initial !== null && !Array.isArray(initial) && (typeof value !== typeof initial || value === null)) return initial;
    return value as T;
  } catch { return initial; }
}

export function readBrowserValue<T>(key: string, initial: T): T {
  return parse(readRaw(key), initial);
}

/** Strict write for account operations: callers must handle storage failures. */
export function writeBrowserValue<T>(key: string, value: T) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  memory.delete(key);
  if (memory.size === 0) storageError = "";
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useBrowserReady() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function useStorageError() {
  return useSyncExternalStore(subscribe, () => storageError, () => "");
}

/** SSR-safe state, shared between routes and tabs without overwriting saved data on mount. */
export function useBrowserState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, initial), [raw, initial]);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    const current = readBrowserValue(key, initial);
    const next = typeof update === "function" ? (update as (value: T) => T)(current) : update;
    try {
      writeBrowserValue(key, next);
    } catch {
      memory.set(key, JSON.stringify(next));
      storageError = "Не удалось сохранить изменения в браузере. Они доступны только в этой вкладке до её закрытия. Проверьте свободное место и разрешение на хранение данных.";
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, [key, initial]);
  return [value, setValue];
}
