"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/app-shell";
import { EmptyState, Icon, PageHeading, Panel } from "@/components/ui";
import { commentActions, demoComments, demoVideos, downloadText, type Comment } from "@/lib/demo-data";

const sentimentLabel: Record<Comment["sentiment"], string> = { positive: "Положительный", neutral: "Нейтральный", negative: "Отрицательный" };
const sentimentStyle: Record<Comment["sentiment"], string> = { positive: "bg-[#edf4e9] text-positive", neutral: "bg-soft text-muted", negative: "bg-[#fff0eb] text-[#ad503b]" };
const MIN_RELIABLE = 30;

export default function CommentsPage() {
  const { toast } = useWorkspace();
  const [sentiment, setSentiment] = useState<Comment["sentiment"] | "all">("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => Object.entries(demoComments.reduce<Record<string, number>>((acc, item) => { acc[item.category] = (acc[item.category] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]), []);
  const visible = demoComments.filter((item) => (sentiment === "all" || item.sentiment === sentiment) && (category === "all" || item.category === category) && `${item.text} ${item.author}`.toLowerCase().includes(query.trim().toLowerCase()));
  const count = (value: Comment["sentiment"]) => demoComments.filter((item) => item.sentiment === value).length;
  const videoTitle = (id: string) => demoVideos.find((video) => video.id === id)?.title ?? "—";

  function exportSummary() {
    const text = `PLEEP·PEEP / АНАЛИЗ КОММЕНТАРИЕВ\nОбработано комментариев: ${demoComments.length}\n\nТональность: положительных ${count("positive")}, нейтральных ${count("neutral")}, отрицательных ${count("negative")}\n\nКатегории и возможные действия:\n${categories.map(([name, total]) => `- ${name} (${total}): ${commentActions[name]}`).join("\n")}\n\nОграничение: выборка меньше ${MIN_RELIABLE} комментариев, достоверность анализа ограничена. Мнение аудитории не является проверенным фактом.`;
    downloadText("pleep-peep-comments.txt", text);
    toast("Сводка по комментариям скачана");
  }

  return <>
    <PageHeading eyebrow="ГОЛОС АУДИТОРИИ" title="Анализ комментариев" description="Тональность, повторяющиеся вопросы и темы. Мнение зрителей показываем отдельно от фактов." >
      <button className="btn btn-secondary" onClick={exportSummary}><Icon name="download" size={16}/>Скачать сводку</button>
    </PageHeading>
    <div role="note" className="mb-5 flex items-start gap-3 rounded-2xl border border-[#f1ddce] bg-[#fcf0e6] p-4 text-xs leading-6 text-[#897460]"><Icon name="info" size={17} className="mt-1 shrink-0"/><span><b className="text-[#8e573e]">Ограниченная достоверность.</b> В выборке {demoComments.length} комментариев — это меньше порога в {MIN_RELIABLE}. Используйте выводы как гипотезы для проверки, а не как готовые факты.</span></div>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">{(["positive", "neutral", "negative"] as const).map((key) => <Panel key={key} className="p-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${sentimentStyle[key]}`}>{sentimentLabel[key]}</span><p className="mt-4 text-3xl font-semibold tracking-tight">{count(key)}</p><p className="mt-1 text-[10px] text-muted">{Math.round(count(key) / demoComments.length * 100)}% от выборки</p></Panel>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
      <Panel className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <label className="relative min-w-40 flex-1"><span className="sr-only">Поиск по комментариям</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"><Icon name="search" size={15}/></span><input className="input !py-2.5 !pl-9 !text-xs" placeholder="Найти комментарий…" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
          <select aria-label="Тональность" className="input !w-auto !py-2.5 !text-xs" value={sentiment} onChange={(event) => setSentiment(event.target.value as typeof sentiment)}><option value="all">Любая тональность</option><option value="positive">Положительные</option><option value="neutral">Нейтральные</option><option value="negative">Отрицательные</option></select>
          <select aria-label="Категория" className="input !w-auto !py-2.5 !text-xs" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Все категории</option>{categories.map(([name]) => <option key={name}>{name}</option>)}</select>
        </div>
        {visible.length ? <ul className="divide-y divide-border">{visible.map((item) => <li key={item.id} className="px-5 py-4"><div className="flex flex-wrap items-center gap-2 text-[10px] text-muted"><span className="font-semibold text-ink">@{item.author}</span><span>·</span><span className="truncate">{videoTitle(item.video)}</span><span className="badge ml-auto">{item.lang === "ru" ? "RU" : "EN"}</span></div><p className="mt-2 text-sm leading-6">{item.text}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${sentimentStyle[item.sentiment]}`}>{sentimentLabel[item.sentiment]}</span><span className="badge">{item.category}</span></div></li>)}</ul> : <EmptyState title="Ничего не найдено" description="Измените фильтры или поисковый запрос."><button className="btn btn-secondary" onClick={() => { setSentiment("all"); setCategory("all"); setQuery(""); }}>Сбросить фильтры</button></EmptyState>}
      </Panel>
      <Panel className="p-6 self-start"><h2 className="text-base font-semibold tracking-tight">Что делать с темами</h2><p className="mt-1 mb-5 text-[10px] text-muted">Группы комментариев и возможные действия</p>
        <ul className="space-y-4">{categories.map(([name, total]) => <li key={name}><button onClick={() => setCategory(category === name ? "all" : name)} className={`w-full rounded-xl border p-4 text-left transition-colors ${category === name ? "border-accent bg-[#fff6f1]" : "border-border hover:bg-canvas"}`}><div className="flex justify-between text-xs font-semibold"><span>{name}</span><span className="text-muted">{total}</span></div><p className="mt-1.5 text-[11px] leading-5 text-muted">→ {commentActions[name]}</p></button></li>)}</ul>
      </Panel>
    </div>
    <p className="mt-5 text-[10px] leading-5 text-[#969d8e]">Демонстрационные комментарии, имена вымышлены. Классификация выполнена заранее, реальный AI-анализ в прототипе не подключён.</p>
  </>;
}
