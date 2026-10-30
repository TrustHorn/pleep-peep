"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Brand, Icon, Modal } from "./ui";
import { CompetitorProvider } from "./competitor-context";

type Period = "7" | "30" | "90";
const WorkspaceContext = createContext<{ period: Period; toast: (message: string) => void }>({ period: "30", toast: () => {} });
export const useWorkspace = () => useContext(WorkspaceContext);
const navigation = [
  { href: "/dashboard", label: "Обзор проекта", icon: "grid", number: "01" },
  { href: "/competitors", label: "Конкуренты", icon: "users", number: "02" },
  { href: "/ai-studio", label: "AI-студия", icon: "sparkles", number: "03" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return <CompetitorProvider><WorkspaceShell>{children}</WorkspaceShell></CompetitorProvider>;
}

function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = navigation.find((item) => pathname.startsWith(item.href)) ?? navigation[0];
  const [period, setPeriod] = useState<Period>("30");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [about, setAbout] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [notification, setNotification] = useState<{ text: string; id: number } | null>(null);
  const toast = useCallback((text: string) => setNotification({ text, id: Date.now() }), []);
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(timer);
  }, [notification]);

  const navLinks = (close?: () => void) => <nav aria-label="Главная навигация" className="space-y-1.5">{navigation.map((item) =>
    <Link key={item.href} href={item.href} onClick={close} aria-current={current.href === item.href ? "page" : undefined} className="sidebar-link flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-[13px] font-medium text-[#737b70] hover:bg-soft hover:text-ink">
      <Icon name={item.icon} size={19}/><span className="flex-1">{item.label}</span>
      {item.icon === "sparkles" ? <span className="rounded bg-[#e1e8d9] px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-[#658053]">AI</span> : <span className="text-[10px] opacity-40">{item.number}</span>}
    </Link>)}</nav>;

  return <WorkspaceContext.Provider value={{ period, toast }}>
    <a href="#main-content" className="fixed -top-20 left-4 z-100 rounded-xl bg-ink px-4 py-3 text-white focus:top-4">К содержимому</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] flex-col border-r border-border bg-white lg:flex">
      <Link href="/" className="px-6 pt-8 pb-8" aria-label="pleep-peep — обзор"><Brand/></Link>
      <div className="mx-5 mb-8 flex items-center gap-2.5 rounded-xl border border-border bg-canvas p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ece6d7] text-[#73654d]"><Icon name="coffee" size={20}/></span>
        <div><p className="text-xs font-semibold">SLOW Coffee</p><p className="mt-1 text-[10px] text-muted">Кофейня · Алматы</p></div><span className="ml-auto h-1.5 w-1.5 rounded-full bg-positive"/>
      </div>
      <div className="px-4"><p className="section-kicker mb-4 px-3.5 text-[9px]">Рабочее пространство</p>{navLinks()}</div>
      <div className="flex-1"/>
      <div className="mx-5 mb-5 overflow-hidden rounded-2xl bg-[#f4f0e7] p-4">
        <div className="mb-3 flex items-center gap-1 text-accent"><Icon name="sparkles" size={20}/><span className="h-px flex-1 bg-[#ddd5c5]"/></div>
        <p className="text-[15px] leading-[1.45] font-semibold tracking-tight">Чуть больше данных.<br/>Гораздо больше идей.</p>
        <Link href="/ai-studio" className="mt-4 flex items-center justify-between text-[11px] font-semibold text-[#8a704e]">Вдохновиться<Icon name="arrow-up-right" size={15}/></Link>
      </div>
      <button onClick={() => setAbout(true)} className="mx-5 mb-4 flex items-center gap-2.5 rounded-xl p-2 text-left text-xs text-muted hover:bg-soft"><Icon name="info" size={17}/>О демо-пространстве</button>
      <div className="mx-5 flex items-center gap-2.5 border-t border-border py-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">SC</span><div><p className="text-xs font-semibold">Команда SLOW</p><p className="mt-1 text-[10px] text-muted">Личное пространство</p></div><span className="ml-auto rounded-md bg-soft px-1.5 py-1 text-[8px] text-muted">DEMO</span></div>
    </aside>
    <div className="min-h-screen lg:ml-[230px]">
      <header className="flex h-[78px] items-center justify-between gap-3 border-b border-border bg-white/80 px-5 sm:px-8 xl:px-10">
        <div className="flex items-center gap-3"><button onClick={() => setMobileMenu(true)} aria-label="Открыть меню" className="rounded-lg p-2 hover:bg-soft lg:hidden"><Icon name="menu"/></button><span className="hidden text-xs text-muted sm:inline">Моё пространство</span><Icon name="chevron-right" size={13} className="hidden text-[#b2b8ac] sm:block"/><span className="text-xs font-medium">{current.label}</span></div>
        <div className="flex items-center gap-2 sm:gap-5">
          <button onClick={() => setAbout(true)} className="hidden items-center gap-1.5 text-[10px] text-muted md:flex"><span className="h-1.5 w-1.5 rounded-full bg-accent"/>Демо-данные</button>
          <button onClick={() => setSearch(true)} className="hidden rounded-lg p-2 text-muted hover:bg-soft sm:block" aria-label="Поиск по страницам"><Icon name="search" size={18}/></button>
          <label className="relative flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2 text-[11px]"><Icon name="calendar" size={15} className="text-muted"/><span className="sr-only">Период исследования</span><select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="max-w-24 appearance-none bg-transparent pr-4 text-[11px] outline-none"><option value="7">7 дней</option><option value="30">30 дней</option><option value="90">90 дней</option></select><Icon name="chevron-down" size={12} className="pointer-events-none absolute right-2"/></label>
          <span className="hidden h-7 w-px bg-border sm:block"/><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6eddf] text-[10px] font-semibold text-[#68795a]" aria-label="Демонстрационное пространство SLOW Coffee">SC</span>
        </div>
      </header>
      <main id="main-content" className="page-enter mx-auto max-w-[1510px] px-5 pt-8 pb-8 sm:px-8 xl:px-10">
        {children}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[10px] text-[#989e93]"><span>pleep·peep <span className="mx-1.5">/</span> от наблюдений к идеям</span><span>Учебное пространство · демонстрационная выборка</span></footer>
      </main>
    </div>
    <Modal open={mobileMenu} onClose={() => setMobileMenu(false)} title="Ваше пространство"><div className="mb-6"><Brand/></div>{navLinks(() => setMobileMenu(false))}</Modal>
    <Modal open={about} onClose={() => setAbout(false)} title="Место для хороших идей" description="Локальный прототип pleep-peep по техническому заданию проекта.">
      <div className="space-y-4 text-[13px] leading-7 text-muted"><p>Исследуйте демонстрационную выборку, сравнивайте аккаунты и собирайте сценарии для своего контента.</p><div className="rounded-xl bg-canvas p-4"><p className="font-semibold text-ink">Всё под рукой</p><p>Три экрана, учебные показатели и шаблоны сценариев. Аккаунты социальных сетей не подключаются. Черновики сохраняются только в этом браузере.</p></div><p>Период учебной выборки: август — октябрь 2026. Новые аккаунты добавляются без метрик, пока нет исходных данных.</p></div>
      <button onClick={() => setAbout(false)} className="btn btn-primary mt-6 w-full">Понятно, начнём<Icon name="arrow-right" size={16}/></button>
    </Modal>
    <Modal open={search} onClose={() => setSearch(false)} title="Куда отправимся?">
      <label className="sr-only" htmlFor="page-search">Поиск страницы</label><input id="page-search" className="input mb-4" placeholder="Найти страницу…" value={query} onChange={(event) => setQuery(event.target.value)}/>
      <div className="space-y-2">{navigation.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).map((item) => <Link key={item.href} href={item.href} onClick={() => { setSearch(false); setQuery(""); }} className="flex items-center gap-3 rounded-xl bg-canvas p-4 hover:bg-soft"><Icon name={item.icon}/><span className="flex-1 text-sm">{item.label}</span><Icon name="arrow-right" size={16}/></Link>)}{!navigation.some((item) => item.label.toLowerCase().includes(query.toLowerCase())) && <p className="py-6 text-center text-sm text-muted">Такой страницы пока нет. Попробуйте «студия».</p>}</div>
    </Modal>
    {notification && <div role="status" className="fixed right-4 bottom-5 left-4 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-xs text-white shadow-xl sm:left-auto sm:max-w-md"><span className="text-[#afc799]"><Icon name="check" size={18}/></span><span className="flex-1">{notification.text}</span><button onClick={() => setNotification(null)} aria-label="Закрыть уведомление" className="ml-3 rounded p-1 text-white/60 hover:text-white"><Icon name="close" size={15}/></button></div>}
  </WorkspaceContext.Provider>;
}
