"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useCompetitorAccounts } from "@/components/competitor-context";
import { EmptyState, Icon, PageHeading, Panel, PlatformBadge } from "@/components/ui";
import { compactNumber, demoVideos, downloadText, percent, type Platform } from "@/lib/demo-data";

type SortKey = "views" | "er" | "duration" | "date";
type Base = "views" | "followers";

export default function AnalyticsPage() {
  const { toast } = useWorkspace();
  const [accounts] = useCompetitorAccounts();
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [base, setBase] = useState<Base>("views");
  const [sort, setSort] = useState<SortKey>("views");

  // ER = (лайки + комментарии + репосты + сохранения) / база × 100%. Если сохранения недоступны — не подставляем, а считаем без них и помечаем.
  const er = (video: (typeof demoVideos)[number]) => (video.likes + video.comments + video.shares + (video.saves ?? 0)) / (base === "views" ? video.views : video.followers) * 100;
  const rows = useMemo(() => demoVideos.filter((video) => platform === "all" || video.platform === platform).sort((a, b) => sort === "er" ? er(b) - er(a) : sort === "date" ? b.date.localeCompare(a.date) : b[sort] - a[sort]), [platform, sort, base]); // eslint-disable-line react-hooks/exhaustive-deps
  const avgDuration = rows.length ? Math.round(rows.reduce((sum, video) => sum + video.duration, 0) / rows.length) : 0;
  const best = [...rows].sort((a, b) => er(b) - er(a))[0];
  const topics = Object.entries(rows.reduce<Record<string, number[]>>((acc, video) => { (acc[video.topic] ??= []).push(er(video)); return acc; }, {})).map(([topic, values]) => ({ topic, count: values.length, avg: values.reduce((a, b) => a + b, 0) / values.length })).sort((a, b) => b.avg - a.avg);
  const baseLabel = base === "views" ? "по просмотрам" : "по подписчикам";

  function exportCsv() {
    const header = "Название;Аккаунт;Платформа;Просмотры;Лайки;Комментарии;Репосты;Сохранения;Длительность, с;Дата;ER " + baseLabel;
    const lines = rows.map((video) => [video.title, `@${video.account}`, video.platform, video.views, video.likes, video.comments, video.shares, video.saves ?? "н/д", video.duration, video.date, er(video).toFixed(2).replace(".", ",") + "%"].join(";"));
    downloadText("pleep-peep-analytics.csv", [header, ...lines].join("\n"));
    toast("Таблица выгружена в CSV");
  }

  return <>
    <PageHeading eyebrow="МЕТРИКИ И СРАВНЕНИЯ" title="Аналитика" description="Сравните публикации и аккаунты. Недоступные метрики остаются пустыми — мы их не придумываем.">
      <button className="btn btn-secondary" onClick={exportCsv} disabled={!rows.length}><Icon name="download" size={16}/>Выгрузить CSV</button>
    </PageHeading>
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-border" role="group" aria-label="Платформа">{(["all", "Instagram", "TikTok"] as const).map((item) => <button key={item} aria-pressed={platform === item} onClick={() => setPlatform(item)} className={`rounded-lg px-3 py-2 text-xs font-medium ${platform === item ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>{item === "all" ? "Все платформы" : item}</button>)}</div>
      <div className="flex items-center gap-2 text-xs"><span className="text-muted">База ER:</span><div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-border" role="group" aria-label="База расчёта ER">{([["views", "Просмотры"], ["followers", "Подписчики"]] as const).map(([key, label]) => <button key={key} aria-pressed={base === key} onClick={() => setBase(key)} className={`rounded-lg px-3 py-2 text-xs font-medium ${base === key ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>{label}</button>)}</div></div>
      <label className="ml-auto flex items-center gap-2 text-xs"><span className="text-muted">Сортировка</span><select className="input !w-auto !py-2 !text-xs" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="views">Просмотры</option><option value="er">ER</option><option value="duration">Длительность</option><option value="date">Дата</option></select></label>
    </div>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <Panel className="p-5"><p className="text-[11px] text-muted">Публикаций в выборке</p><p className="mt-3 text-3xl font-semibold tracking-tight">{rows.length}</p></Panel>
      <Panel className="p-5"><p className="text-[11px] text-muted">Средняя длительность</p><p className="mt-3 text-3xl font-semibold tracking-tight">{avgDuration} с</p></Panel>
      <Panel className="p-5"><p className="text-[11px] text-muted">Лучший ER {baseLabel}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{best ? percent(er(best)) : "—"}</p>{best && <p className="mt-1 truncate text-[10px] text-muted">{best.title}</p>}</Panel>
    </div>
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-5 py-4 sm:px-6"><h2 className="text-base font-semibold tracking-tight">Публикации</h2><p className="mt-1 text-[10px] text-muted">ER = (лайки + комментарии + репосты + сохранения) / {base === "views" ? "просмотры" : "подписчики аккаунта"} × 100%. Если сохранения недоступны, они не учитываются — такие значения помечены «*».</p></div>
      {rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr>{["Публикация", "Платформа", "Просмотры", "Лайки", "Комм.", "Репосты", "Сохр.", "Длит.", "ER"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium first:px-6">{heading}</th>)}</tr></thead>
        <tbody>{rows.map((video) => <tr key={video.id} className="border-t border-border/80 hover:bg-canvas/70"><th scope="row" className="px-6 py-4 font-normal"><span className="block font-semibold">{video.title}</span><span className="mt-0.5 block text-[10px] text-muted">@{video.account} · {video.date}</span></th><td className="px-4"><PlatformBadge platform={video.platform} compact/></td><td className="px-4 tabular-nums">{compactNumber(video.views)}</td><td className="px-4 tabular-nums">{compactNumber(video.likes)}</td><td className="px-4 tabular-nums">{compactNumber(video.comments)}</td><td className="px-4 tabular-nums">{compactNumber(video.shares)}</td><td className="px-4 tabular-nums">{compactNumber(video.saves)}</td><td className="px-4 tabular-nums">{video.duration} с</td><td className="px-4 font-semibold tabular-nums">{percent(er(video))}{video.saves === null && <span title="Сохранения недоступны" className="text-muted">*</span>}</td></tr>)}</tbody></table></div> : <EmptyState title="Нет публикаций" description="По выбранной платформе в выборке ничего нет."/>}
    </Panel>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Темы по вовлечённости</h2><p className="mt-1 mb-5 text-[10px] text-muted">Средний ER {baseLabel}</p>
        {topics.length ? <div className="space-y-4">{topics.map((item) => <div key={item.topic}><div className="mb-1.5 flex justify-between text-xs"><span>{item.topic} <span className="text-muted">· {item.count}</span></span><span className="font-medium">{percent(item.avg)}</span></div><div className="h-1.5 rounded-full bg-canvas"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, item.avg / (topics[0].avg || 1) * 100)}%` }}/></div></div>)}</div> : <p className="text-xs text-muted">Нет данных.</p>}
      </Panel>
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Сравнение аккаунтов</h2><p className="mt-1 mb-4 text-[10px] text-muted">Из списка конкурентов · ER по просмотрам</p>
        <ul className="divide-y divide-border text-xs">{accounts.map((account) => <li key={account.id} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0"><span className="block truncate font-medium">{account.name}</span><span className="text-[10px] text-muted">@{account.handle} · {account.platform}</span></span><span className="shrink-0 text-right tabular-nums"><span className="block font-medium">{account.views && account.interactions !== null ? percent(account.interactions / account.views * 100) : "—"}</span><span className="text-[10px] text-muted">{compactNumber(account.views)} просм.</span></span></li>)}</ul>
      </Panel>
    </div>
    <p className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-[#969d8e]"><Icon name="info" size={13} className="mt-0.5 shrink-0"/>Демонстрационные данные. Вывод носит вероятностный характер и не гарантирует просмотры или попадание в рекомендации.</p>
  </>;
}
