"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, Icon } from "@/components/ui";
import { useAuth } from "@/components/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Введите корректный адрес почты."); return; }
    if (password.length < 8) { setError("Пароль должен содержать не менее 8 символов."); return; }
    if (busy || !ready) return;
    setBusy(true);
    try { await login(email, password); router.push("/dashboard"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось войти."); }
    finally { setBusy(false); }
  }

  return <AuthCard title="С возвращением" description="Войдите, чтобы продолжить работу над исследованием." footer={<>Нет аккаунта? <Link href="/register" className="font-semibold text-accent hover:underline">Зарегистрироваться</Link></>}>
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div><label htmlFor="login-email" className="field-label">Почта</label><input id="login-email" type="email" autoComplete="email" className="input" placeholder="name@company.com" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} required/></div>
      <div><label htmlFor="login-password" className="field-label">Пароль</label><input id="login-password" type="password" autoComplete="current-password" className="input" placeholder="Не менее 8 символов" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required/></div>
      {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs leading-relaxed text-[#ad503b]">{error}</p>}
      <button type="submit" disabled={busy || !ready} className="btn btn-primary w-full"><Icon name="lock" size={16}/>{busy ? "Входим…" : "Войти"}</button>
      <Link href="/dashboard" className="btn btn-secondary w-full">Посмотреть демо без входа<Icon name="arrow-right" size={16}/></Link>
    </form>
  </AuthCard>;
}
