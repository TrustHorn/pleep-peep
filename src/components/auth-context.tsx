"use client";

import { createContext, useContext, type ReactNode } from "react";
import { readBrowserValue, useBrowserReady, useBrowserState, useStorageError, writeBrowserValue } from "@/lib/browser-storage";

export type LocalUser = { id: string; name: string; email: string; language: string; createdAt: string };
type StoredUser = LocalUser & { salt: string; passwordHash: string };
type Session = { userId: string; signedInAt: string } | null;
type Profile = Pick<LocalUser, "name" | "email" | "language">;
type AuthState = {
  user: LocalUser | null;
  ready: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
};
const AuthContext = createContext<AuthState | null>(null);
const EMPTY_USERS: StoredUser[] = [];
const normalizeEmail = (email: string) => email.trim().toLowerCase();

function getUsers() {
  return readBrowserValue<StoredUser[]>("accounts", EMPTY_USERS).filter((user) =>
    user && typeof user.id === "string" && typeof user.email === "string" && typeof user.passwordHash === "string" && typeof user.salt === "string");
}

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210_000 }, key, 256);
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validateProfile({ name, email }: Profile) {
  if (name.trim().length < 2) throw new Error("Имя — не менее 2 символов.");
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new Error("Введите корректный адрес почты.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts] = useBrowserState<StoredUser[]>("accounts", EMPTY_USERS);
  const [session] = useBrowserState<Session>("session", null);
  const ready = useBrowserReady();
  const stored = accounts.find((item) => item?.id === session?.userId);
  const user: LocalUser | null = stored ? { id: stored.id, name: stored.name, email: stored.email, language: stored.language, createdAt: stored.createdAt } : null;

  async function register(name: string, email: string, password: string) {
    validateProfile({ name, email, language: "ru" });
    if (password.length < 8) throw new Error("Пароль должен содержать не менее 8 символов.");
    const normalized = normalizeEmail(email);
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const passwordHash = await hashPassword(password, salt);
    // Re-read after hashing so another registration in this tab is not overwritten.
    const current = getUsers();
    if (current.some((item) => normalizeEmail(item.email) === normalized)) throw new Error("Аккаунт с этой почтой уже существует. Войдите в него.");
    const account: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized, language: "ru", salt, passwordHash, createdAt: new Date().toISOString() };
    try {
      writeBrowserValue("accounts", [...current, account]);
      writeBrowserValue<Session>("session", { userId: account.id, signedInAt: new Date().toISOString() });
    } catch { throw new Error("Не удалось сохранить аккаунт или вход. Разрешите хранение данных в браузере и попробуйте войти снова."); }
  }

  async function login(email: string, password: string) {
    const account = getUsers().find((item) => normalizeEmail(item.email) === normalizeEmail(email));
    if (!account || await hashPassword(password, account.salt) !== account.passwordHash) throw new Error("Неверная почта или пароль. Используйте аккаунт, зарегистрированный в этом браузере.");
    try { writeBrowserValue<Session>("session", { userId: account.id, signedInAt: new Date().toISOString() }); }
    catch { throw new Error("Не удалось сохранить вход. Разрешите хранение данных в браузере."); }
  }

  function logout() { writeBrowserValue<Session>("session", null); }

  function updateProfile(profile: Profile) {
    if (!user) throw new Error("Войдите, чтобы изменить профиль аккаунта.");
    validateProfile(profile);
    const current = getUsers();
    const email = normalizeEmail(profile.email);
    if (current.some((item) => item.id !== user.id && normalizeEmail(item.email) === email)) throw new Error("Эта почта уже используется другим аккаунтом.");
    try { writeBrowserValue("accounts", current.map((item) => item.id === user.id ? { ...item, name: profile.name.trim(), email, language: profile.language } : item)); }
    catch { throw new Error("Не удалось сохранить профиль. Проверьте хранилище браузера."); }
  }

  return <AuthContext.Provider value={{ user, ready, register, login, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function useUserState<T>(key: string, initial: T) {
  const { user } = useAuth();
  return useBrowserState<T>(`user:${user?.id ?? "demo"}:${key}`, initial);
}

export function StorageNotice() {
  const error = useStorageError();
  return error ? <div role="alert" className="fixed right-4 bottom-24 left-4 z-50 rounded-xl border border-[#e0b59d] bg-[#fff0eb] p-4 text-sm text-[#853f2e] lg:left-[250px]">{error}</div> : null;
}
