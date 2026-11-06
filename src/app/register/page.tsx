"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, Icon } from "@/components/ui";
import { useAuth } from "@/components/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", repeat: "", agree: false });
  const [error, setError] = useState("");
  const update = (patch: Partial<typeof form>) => { setForm((previous) => ({ ...previous, ...patch })); setError(""); };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.name.trim().length < 2) { setError("Укажите имя: не менее 2 символов."); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { setError("Введите корректный адрес почты."); return; }
    if (form.password.length < 8) { setError("Пароль должен содержать не менее 8 символов."); return; }
    if (form.password !== form.repeat) { setError("Пароли не совпадают."); return; }
    if (!form.agree) { setError("Подтвердите, что понимаете: это демонстрационный режим."); return; }
    if (busy || !ready) return;
    setBusy(true);
    try { await register(form.name, form.email, form.password); router.push("/projects"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать аккаунт."); }
    finally { setBusy(false); }
  }

  return <AuthCard title="Создать аккаунт" description="Начните исследование контента: проекты, конкуренты, идеи и отчёты в одном месте." footer={<>Уже есть аккаунт? <Link href="/login" className="font-semibold text-accent hover:underline">Войти</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div><label htmlFor="reg-name" className="field-label">Имя</label><input id="reg-name" autoComplete="name" className="input" value={form.name} onChange={(event) => update({ name: event.target.value })} required/></div>
      <div><label htmlFor="reg-email" className="field-label">Почта</label><input id="reg-email" type="email" autoComplete="email" className="input" placeholder="name@company.com" value={form.email} onChange={(event) => update({ email: event.target.value })} required/></div>
      <div><label htmlFor="reg-password" className="field-label">Пароль</label><input id="reg-password" type="password" autoComplete="new-password" className="input" value={form.password} onChange={(event) => update({ password: event.target.value })} required/></div>
      <div><label htmlFor="reg-repeat" className="field-label">Повторите пароль</label><input id="reg-repeat" type="password" autoComplete="new-password" className="input" value={form.repeat} onChange={(event) => update({ repeat: event.target.value })} required/></div>
      <label className="flex items-start gap-2.5 text-xs leading-5 text-muted"><input type="checkbox" className="mt-1" checked={form.agree} onChange={(event) => update({ agree: event.target.checked })}/>Понимаю, что аккаунт и данные сохраняются только в этом браузере и удалятся при очистке его данных. Использую отдельный пароль для прототипа.</label>
      {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs leading-relaxed text-[#ad503b]">{error}</p>}
      <button type="submit" disabled={busy || !ready} className="btn btn-primary w-full">{busy ? "Создаём…" : "Создать аккаунт"}<Icon name="arrow-right" size={16}/></button>
    </form>
  </AuthCard>;
}
