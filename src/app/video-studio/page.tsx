"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/app-shell";
import { EmptyState, Icon, PageHeading, Panel, PlatformBadge } from "@/components/ui";
import { downloadText } from "@/lib/demo-data";

// Формат совпадает с черновиками AI-студии (ключ localStorage).
type Scene = { time: string; title: string; visual: string; voice: string };
type Idea = { title: string; hook: string; scenes: Scene[]; cta: string; description: string; hashtags: string };
type Draft = { id: string; savedAt: string; brief: { platform: "Instagram" | "TikTok"; duration: string; topic: string }; ideas: Idea[]; selected: number };
type Status = "Черновик" | "На согласовании" | "Утверждён";

const STORAGE_KEY = "pleep-peep:studio-drafts:v1";
const steps = ["Идея", "Сценарий", "Подтверждение", "Видеочерновик", "Правки", "Экспорт"];

const sampleDraft: Draft = { id: "sample", savedAt: "демо", brief: { platform: "Instagram", duration: "30", topic: "Кофе, ради которого хочется замедлиться" }, selected: 0, ideas: [{ title: "Маленький ритуал большого города", hook: "Этот кофе я варю в 7:40 — и город ждёт.", scenes: [{ time: "0–5 с", title: "Крючок", visual: "Крупный план: струя воды над кофе", voice: "Этот кофе я варю в 7:40." }, { time: "5–20 с", title: "Процесс", visual: "Руки бариста, пар, окно с утренним светом", voice: "Три простых движения, и утро становится медленнее." }, { time: "20–30 с", title: "Финал", visual: "Чашка на стойке, логотип", voice: "Заходите за своим ритуалом." }], cta: "Сохраните, чтобы повторить дома", description: "Утро без спешки. Расскажите, как начинается ваше.", hashtags: "#slowmorning #кофеалматы" }] };

function loadDrafts(): Draft[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is Draft => !!item && typeof item === "object" && Array.isArray((item as Draft).ideas) && (item as Draft).ideas.length > 0) : [];
  } catch { return []; }
}

export default function VideoStudioPage() {
  const { toast } = useWorkspace();
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [active, setActive] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => { const timer = setTimeout(() => setDrafts(loadDrafts()), 0); return () => clearTimeout(timer); }, []);

  if (drafts === null) return <p className="py-20 text-center text-xs text-muted" role="status">Загружаем черновики…</p>;
  const list = drafts.length ? drafts : [sampleDraft];
  const draft = list[Math.min(active, list.length - 1)];
  const idea = draft.ideas[Math.min(draft.selected, draft.ideas.length - 1)];
  const status = statuses[draft.id] ?? "Черновик";
  const title = titles[draft.id] ?? idea.title;
  const scene = idea.scenes[Math.min(sceneIndex, idea.scenes.length - 1)];
  const stage = status === "Утверждён" ? 5 : status === "На согласовании" ? 2 : 3;
  const setStatus = (next: Status) => { setStatuses((previous) => ({ ...previous, [draft.id]: next })); toast(next === "Утверждён" ? "Видеочерновик утверждён" : next === "На согласовании" ? "Отправлено владельцу проекта на утверждение" : "Возвращено в черновик"); };

  function exportPlan() {
    const text = `${title}\nПлатформа: ${draft.brief.platform}, ${draft.brief.duration} с\nСтатус: ${status}\n\nВступление: ${idea.hook}\n\n${idea.scenes.map((item, i) => `${i + 1}. [${item.time}] ${item.title}\n   Кадр: ${item.visual}\n   Озвучка: ${item.voice}`).join("\n\n")}\n\nПризыв: ${idea.cta}\nОписание: ${idea.description}\n${idea.hashtags}\n\nЭто раскадровка видеочерновика. Видеофайл в прототипе не создаётся.`;
    downloadText("pleep-peep-storyboard.txt", text);
    toast("Раскадровка скачана");
  }

  return <>
    <PageHeading eyebrow="ОТ СЦЕНАРИЯ К ЧЕРНОВИКУ" title="Видеостудия" description="Просмотрите раскадровку, отредактируйте название и отправьте черновик на утверждение.">
      <button className="btn btn-secondary" onClick={exportPlan}><Icon name="download" size={16}/>Скачать раскадровку</button>
    </PageHeading>
    <ol className="mb-6 flex flex-wrap gap-2 text-[10px]" aria-label="Этапы создания видео">{steps.map((name, index) => <li key={name} aria-current={index === stage ? "step" : undefined} className={`rounded-full px-3 py-1.5 font-semibold ${index < stage ? "bg-[#edf4e9] text-positive" : index === stage ? "bg-ink text-white" : "bg-soft text-muted"}`}>{index + 1}. {name}</li>)}</ol>
    <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
      <Panel className="self-start p-4"><h2 className="section-kicker mb-3 px-2">Черновики</h2>
        <ul className="space-y-1.5">{list.map((item, index) => <li key={item.id}><button onClick={() => { setActive(index); setSceneIndex(0); }} aria-pressed={index === active} className={`w-full rounded-xl px-3 py-3 text-left text-xs ${index === active ? "bg-[#fae9e0] text-[#bd5738]" : "hover:bg-soft"}`}><span className="block truncate font-semibold">{titles[item.id] ?? item.ideas[item.selected]?.title ?? item.ideas[0].title}</span><span className="mt-1 block text-[10px] text-muted">{item.savedAt} · {statuses[item.id] ?? "Черновик"}</span></button></li>)}</ul>
        {!drafts.length && <p className="mt-3 rounded-xl bg-canvas p-3 text-[11px] leading-5 text-muted">Это пример. Сохраните сценарий в <Link href="/ai-studio" className="font-semibold text-accent">AI-студии</Link>, и он появится здесь.</p>}
      </Panel>
      <div className="min-w-0 space-y-5">
        <Panel className="p-6">
          <div className="flex flex-wrap items-center gap-3"><PlatformBadge platform={draft.brief.platform}/><span className="badge">{draft.brief.duration} с</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "Утверждён" ? "bg-[#edf4e9] text-positive" : status === "На согласовании" ? "bg-[#f4edda] text-[#8f793e]" : "bg-soft text-muted"}`}>{status}</span></div>
          <label htmlFor="video-title" className="field-label mt-5">Название ролика</label>
          <input id="video-title" className="input" value={title} maxLength={90} disabled={status === "Утверждён"} onChange={(event) => setTitles((previous) => ({ ...previous, [draft.id]: event.target.value }))}/>
          <p className="mt-4 text-xs leading-6 text-muted"><b className="text-ink">Вступление:</b> {idea.hook}</p>
        </Panel>
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Раскадровка</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="mx-auto flex aspect-[9/16] w-full max-w-[180px] flex-col justify-end rounded-2xl bg-[#424b3c] p-4 text-[#ebeadf]"><p className="text-[9px] tracking-widest opacity-70">{scene.time}</p><p className="mt-2 text-sm font-semibold leading-snug">{scene.title}</p><p className="mt-2 text-[10px] leading-4 opacity-80">{scene.visual}</p></div>
            <div><div className="flex flex-wrap gap-2" role="tablist" aria-label="Сцены">{idea.scenes.map((item, index) => <button key={index} role="tab" aria-selected={index === sceneIndex} onClick={() => setSceneIndex(index)} className={`rounded-lg px-3 py-2 text-[11px] font-medium ${index === sceneIndex ? "bg-ink text-white" : "bg-canvas text-muted hover:text-ink"}`}>{index + 1}. {item.title}</button>)}</div>
              <dl className="mt-4 space-y-3 text-xs leading-6"><div><dt className="text-[10px] font-semibold tracking-wide text-muted">ВРЕМЯ</dt><dd>{scene.time}</dd></div><div><dt className="text-[10px] font-semibold tracking-wide text-muted">КАДР</dt><dd>{scene.visual}</dd></div><div><dt className="text-[10px] font-semibold tracking-wide text-muted">ОЗВУЧКА</dt><dd>{scene.voice}</dd></div></dl></div>
          </div>
          <div className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted"><p><b className="text-ink">Призыв:</b> {idea.cta}</p><p><b className="text-ink">Описание:</b> {idea.description} <span className="text-[#7b856f]">{idea.hashtags}</span></p></div>
        </Panel>
        <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="max-w-md text-[11px] leading-5 text-muted">Утверждать контент может только владелец проекта. В прототипе кнопки имитируют согласование; видеофайл не рендерится.</p>
          <div className="flex gap-2">{status === "Черновик" && <button className="btn btn-primary" onClick={() => setStatus("На согласовании")}>Отправить на утверждение</button>}{status === "На согласовании" && <><button className="btn btn-secondary" onClick={() => setStatus("Черновик")}>Вернуть на доработку</button><button className="btn btn-primary" onClick={() => setStatus("Утверждён")}><Icon name="check" size={16}/>Утвердить</button></>}{status === "Утверждён" && <button className="btn btn-secondary" onClick={() => setStatus("Черновик")}>Снять утверждение</button>}</div>
        </Panel>
      </div>
    </div>
    {!list.length && <EmptyState title="Нет черновиков" description="Создайте сценарий в AI-студии."/>}
  </>;
}
