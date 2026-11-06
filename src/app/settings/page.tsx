"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { PageHeading, Panel } from "@/components/ui";

export default function SettingsPage() {
  const { toast } = useWorkspace();
  const [profile, setProfile] = useState({ name: "Айдана Серикова", email: "aidana@slow.example", language: "ru" });
  const [project, setProject] = useState({ name: "SLOW Coffee", niche: "Кофейня · Алматы", base: "views", period: "30" });
  const [notify, setNotify] = useState({ reports: true, comments: false, team: true });
  const [error, setError] = useState("");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profile.name.trim().length < 2) { setError("Имя — не менее 2 символов."); return; }
    if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) { setError("Введите корректный адрес почты."); return; }
    setError(""); toast("Профиль сохранён (только в этой сессии)");
  }

  return <>
    <PageHeading eyebrow="ВАШЕ ПРОСТРАНСТВО" title="Настройки" description="Профиль, параметры проекта и уведомления. Изменения сохраняются до перезагрузки страницы."/>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Профиль</h2>
        <form onSubmit={saveProfile} className="mt-5 space-y-4" noValidate>
          <div><label htmlFor="set-name" className="field-label">Имя</label><input id="set-name" className="input" value={profile.name} onChange={(event) => { setProfile({ ...profile, name: event.target.value }); setError(""); }}/></div>
          <div><label htmlFor="set-email" className="field-label">Почта</label><input id="set-email" type="email" className="input" value={profile.email} onChange={(event) => { setProfile({ ...profile, email: event.target.value }); setError(""); }}/></div>
          <div><label htmlFor="set-lang" className="field-label">Язык интерфейса</label><select id="set-lang" className="input" value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}><option value="ru">Русский</option><option value="en" disabled>English (скоро)</option></select></div>
          {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}
          <button type="submit" className="btn btn-primary">Сохранить профиль</button>
        </form></Panel>
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Проект по умолчанию</h2>
        <form onSubmit={(event) => { event.preventDefault(); toast("Настройки проекта сохранены (только в этой сессии)"); }} className="mt-5 space-y-4">
          <div><label htmlFor="set-project" className="field-label">Название</label><input id="set-project" className="input" value={project.name} onChange={(event) => setProject({ ...project, name: event.target.value })}/></div>
          <div><label htmlFor="set-niche" className="field-label">Ниша</label><input id="set-niche" className="input" value={project.niche} onChange={(event) => setProject({ ...project, niche: event.target.value })}/></div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="set-base" className="field-label">База ER</label><select id="set-base" className="input" value={project.base} onChange={(event) => setProject({ ...project, base: event.target.value })}><option value="views">Просмотры</option><option value="followers">Подписчики</option></select></div><div><label htmlFor="set-period" className="field-label">Период</label><select id="set-period" className="input" value={project.period} onChange={(event) => setProject({ ...project, period: event.target.value })}><option value="7">7 дней</option><option value="30">30 дней</option><option value="90">90 дней</option></select></div></div>
          <button type="submit" className="btn btn-primary">Сохранить проект</button>
        </form></Panel>
      <Panel className="p-6 xl:col-span-2"><h2 className="text-base font-semibold tracking-tight">Уведомления</h2>
        <ul className="mt-4 divide-y divide-border">{([["reports", "Готов новый AI Summary"], ["comments", "Появились новые комментарии для анализа"], ["team", "Изменения в команде"]] as const).map(([key, label]) => <li key={key} className="flex items-center justify-between gap-4 py-3.5 text-xs"><span id={`n-${key}`}>{label}</span><button role="switch" aria-checked={notify[key]} aria-labelledby={`n-${key}`} onClick={() => setNotify({ ...notify, [key]: !notify[key] })} className={`relative h-6 w-11 rounded-full transition-colors ${notify[key] ? "bg-positive" : "bg-[#d1d7ca]"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notify[key] ? "left-[22px]" : "left-0.5"}`}/></button></li>)}</ul>
        <p className="mt-3 text-[10px] text-muted">Уведомления в прототипе не отправляются.</p></Panel>
    </div>
  </>;
}
