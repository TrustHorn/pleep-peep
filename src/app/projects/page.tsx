"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useProjects } from "@/components/project-context";
import { Icon, Modal, PageHeading, Panel, PlatformBadge } from "@/components/ui";
import { demoProjects, type Platform, type Project } from "@/lib/demo-data";

const statusStyle: Record<Project["status"], string> = { "Активный": "bg-[#edf4e9] text-positive", "На паузе": "bg-[#f4edda] text-[#8f793e]", "Завершён": "bg-soft text-muted" };

export default function ProjectsPage() {
  const { toast } = useWorkspace();
  const [projects, setProjects] = useProjects();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram"]);
  const [error, setError] = useState("");
  const isDemo = (project: Project) => demoProjects.some((item) => item.id === project.id);

  function toggle(platform: Platform) { setPlatforms((previous) => previous.includes(platform) ? previous.filter((item) => item !== platform) : [...previous, platform]); setError(""); }
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 3) { setError("Название проекта — не менее 3 символов."); return; }
    if (!platforms.length) { setError("Выберите хотя бы одну платформу."); return; }
    setProjects((previous) => [{ id: `local-${Date.now()}`, name: name.trim(), goal: goal.trim() || "Цель пока не указана.", platforms, status: "Активный", competitors: 0, videos: 0, updated: "сегодня", history: [{ date: "сегодня", text: "Проект создан" }] }, ...previous]);
    toast(`Проект «${name.trim()}» создан`);
    setOpen(false); setName(""); setGoal(""); setPlatforms(["Instagram"]); setError("");
  }

  return <>
    <PageHeading eyebrow="КЛИЕНТСКИЕ ИССЛЕДОВАНИЯ" title="Проекты" description="Каждый проект — отдельное исследование со своими конкурентами, целями и историей.">
      <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={17}/>Новый проект</button>
    </PageHeading>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const body = <><div className="mb-4 flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[project.status]}`}>{project.status}</span><span className="text-[10px] text-muted">Обновлён: {project.updated}</span></div>
          <h2 className="text-[17px] leading-snug font-semibold tracking-tight">{project.name}</h2><p className="mt-2.5 text-xs leading-6 text-muted">{project.goal}</p>
          <div className="mt-4 flex gap-2">{project.platforms.map((platform) => <PlatformBadge key={platform} platform={platform}/>)}</div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs"><div><p className="text-muted">Конкурентов</p><p className="mt-1 text-lg font-semibold">{project.competitors}</p></div><div><p className="text-muted">Видео</p><p className="mt-1 text-lg font-semibold">{project.videos}</p></div></div></>;
        return isDemo(project)
          ? <Link key={project.id} href={`/projects/${project.id}/`} className="block"><Panel className="h-full p-6 transition-transform hover:-translate-y-1">{body}</Panel></Link>
          : <button key={project.id} onClick={() => setSelected(project)} className="block text-left"><Panel className="h-full p-6 transition-transform hover:-translate-y-1">{body}</Panel></button>;
      })}
    </div>
    <p className="mt-6 flex items-start gap-2 text-[10px] leading-5 text-[#969d8e]"><Icon name="info" size={13} className="mt-0.5 shrink-0"/>Проекты сохраняются в этом браузере, отдельно для каждого аккаунта. Страницы деталей есть у демонстрационных проектов, созданные вами открываются в окне.</p>
    <Modal open={open} onClose={() => setOpen(false)} title="Новый проект" description="Опишите, что хотите исследовать.">
      <form onSubmit={create} className="space-y-5" noValidate>
        <div><label htmlFor="project-name" className="field-label">Название <span className="text-accent">*</span></label><input id="project-name" className="input" value={name} maxLength={80} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Например, Летнее меню"/></div>
        <div><label htmlFor="project-goal" className="field-label">Цель исследования</label><textarea id="project-goal" rows={3} className="input" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Что вы хотите понять?"/></div>
        <fieldset><legend className="field-label">Платформы</legend><div className="flex gap-2">{(["Instagram", "TikTok"] as const).map((platform) => <button type="button" key={platform} aria-pressed={platforms.includes(platform)} onClick={() => toggle(platform)} className={`btn ${platforms.includes(platform) ? "btn-primary" : "btn-secondary"}`}>{platform}</button>)}</div></fieldset>
        {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Отмена</button><button type="submit" className="btn btn-primary">Создать проект</button></div>
      </form>
    </Modal>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? "Проект"} description={selected?.goal}>
      {selected && <div className="space-y-4"><div className="flex gap-2">{selected.platforms.map((platform) => <PlatformBadge key={platform} platform={platform}/>)}</div><p className="rounded-xl bg-canvas p-4 text-xs leading-6 text-muted">Проект сохранён в этом браузере и пока без данных. Добавьте конкурентов, чтобы начать анализ.</p><Link href="/competitors" onClick={() => setSelected(null)} className="btn btn-primary w-full">Добавить конкурентов<Icon name="arrow-right" size={16}/></Link></div>}
    </Modal>
  </>;
}
