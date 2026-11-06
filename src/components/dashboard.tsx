"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useWorkspace } from "./app-shell";
import { useCompetitorAccounts } from "./competitor-context";
import { EmptyState, Icon, Modal, PageHeading, Panel, PlatformBadge } from "./ui";
import { demoVideos, type Video } from "@/lib/demo-data";
import { dateRangeDays, filterVideosByDateRange, formatDate, formatDateRange, previousDateRange, shiftDate, summarizeVideos, type DateRange } from "@/lib/date-range";

const publicationExamples = [
  { title: "Маленький ритуал большого города", account: "@daily.brew", platform: "TikTok" as const, views: "184,2 тыс.", er: "9,4%", duration: "0:24", variant: 0, idea: "Первый кофе, свет из окна и город, который ещё не проснулся. Знакомые детали помогают зрителю узнать своё утро." },
  { title: "По ту сторону кофейной стойки", account: "@slowclub.coffee", platform: "Instagram" as const, views: "126,8 тыс.", er: "8,6%", duration: "0:31", variant: 1, idea: "Бариста рассказывает, почему выбирает именно эти зёрна. Живой рассказ и кадры процесса вместо рекламного объявления." },
  { title: "Кофе без спешки: 3 простых шага", account: "@bean.and.co", platform: "Instagram" as const, views: "98,6 тыс.", er: "7,9%", duration: "0:19", variant: 2, idea: "Три коротких совета для домашнего кофе. Понятная структура и полезные детали мотивируют сохранить публикацию." },
];

function CoffeePoster({ variant }: { variant: number }) {
  if (variant === 1) return <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="200" fill="#424b3c"/><circle cx="267" cy="95" r="98" fill="#eeb28b"/><path d="M205 68h70v56c0 42-70 42-70 0V68Z" fill="#fbf2df"/><path d="M275 79c39-10 39 43 0 37" fill="none" stroke="#fbf2df" strokeWidth="12"/><path d="M218 53c-15-15 10-18 0-30m23 30c-15-15 10-18 0-30" stroke="#fbf2df" strokeWidth="2" fill="none"/><text x="22" y="47" fill="#ebeadf" fontSize="10" letterSpacing="3">SLOW CLUB</text><text x="20" y="90" fill="#ebeadf" fontSize="36" fontWeight="600" letterSpacing="-1">meet your</text><text x="20" y="133" fill="#ebeadf" fontSize="42" fontStyle="italic" fontFamily="Georgia,serif">barista.</text><path d="M24 165h75" stroke="#e8a783" strokeWidth="2"/></svg>;
  if (variant === 2) return <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="200" fill="#e7eacb"/><path d="M0 175 320 45M0 210 320 80M0 245 320 115" stroke="#cdd5ad" strokeWidth="22"/><text x="21" y="37" fill="#697149" fontSize="10" letterSpacing="3">A LITTLE COFFEE GUIDE</text><text x="20" y="82" fill="#4c5735" fontSize="42" fontWeight="700" letterSpacing="-2">LESS RUSH.</text><text x="20" y="123" fill="#4c5735" fontSize="42" fontWeight="700" letterSpacing="-2">MORE</text><text x="20" y="164" fill="#4c5735" fontSize="42" fontWeight="700" letterSpacing="-2">COFFEE.</text><circle cx="273" cy="148" r="29" fill="#f6f4e3"/><ellipse cx="273" cy="148" rx="20" ry="20" fill="#8c644a"/><path d="M267 141c14-11 22 12 5 14-13-2-9-11-5-14" stroke="#e8d6b9" strokeWidth="3" fill="none"/></svg>;
  return <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="200" fill="#ead8bf"/><path d="M0 0h320v200H0Z" fill="#efdfca"/><path d="m175 0 80 200M225 0l80 200" stroke="#e1c9ac" strokeWidth="30"/><ellipse cx="232" cy="145" rx="57" ry="16" fill="#beac91" opacity=".35"/><circle cx="228" cy="104" r="57" fill="#faf2e1"/><circle cx="228" cy="104" r="44" fill="#9b7252"/><circle cx="228" cy="104" r="39" fill="#bc946a"/><path d="M229 127c-27-21-30-40-13-38 8 0 12 7 13 12 4-15 20-19 21-6 1 11-10 23-21 32Z" fill="#f0dfbe"/><text x="21" y="36" fill="#7a654d" fontSize="10" letterSpacing="3">THE EVERYDAY EDIT</text><text x="19" y="92" fill="#4a4938" fontSize="39" fontWeight="600" letterSpacing="-2">slow</text><text x="19" y="131" fill="#4a4938" fontSize="36" fontStyle="italic" fontFamily="Georgia,serif">mornings.</text><text x="23" y="168" fill="#7a654d" fontSize="9" letterSpacing="2">ONE CUP AT A TIME</text></svg>;
}

const compact = (value: number) => new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 2 }).format(value);
function TrendChart({ metric, dateRange, videos }: { metric: "views" | "er"; dateRange: DateRange; videos: Video[] }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const days = dateRangeDays(dateRange);
  const bucketCount = Math.min(15, days);
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({ from: shiftDate(dateRange.from, Math.floor(index * days / bucketCount)), to: shiftDate(dateRange.from, Math.floor((index + 1) * days / bucketCount) - 1) }));
  const valuesFor = (offset: number) => buckets.map((bucket) => {
    const stats = summarizeVideos(filterVideosByDateRange({ from: shiftDate(bucket.from, offset), to: shiftDate(bucket.to, offset) }, videos));
    return metric === "views" ? stats.views : stats.er;
  });
  const values = valuesFor(0);
  const previousValues = valuesFor(-days);
  const domain = Math.max(metric === "views" ? 1 : 10, ...values, ...previousValues) * 1.1;
  const coordinates = (data: number[]) => data.map((value, index) => ({ x: data.length === 1 ? 400 : index * 800 / (data.length - 1), y: 195 - value / domain * 180 }));
  const points = coordinates(values);
  const pathFor = (data: typeof points) => data.reduce((path, point, index) => {
    if (!index) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, "");
  const curve = pathFor(points);
  const previousCurve = pathFor(coordinates(previousValues));
  const valueLabel = (value: number) => metric === "views" ? compact(value) : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
  const current = hover === null ? null : points[hover];
  return <div className="mt-6">
    <div className="flex gap-3"><div className="flex h-[192px] w-9 shrink-0 flex-col justify-between pb-1 text-[9px] text-[#9ca294]">{[1, .75, .5, .25, 0].map((fraction) => <span key={fraction}>{valueLabel(domain * fraction)}</span>)}</div>
      <div className="relative min-w-0 flex-1" onMouseLeave={() => setHover(null)}>
        <svg viewBox="0 0 800 210" preserveAspectRatio="none" className="h-[195px] w-full overflow-visible" role="img" aria-label={`${metric === "views" ? "Просмотры" : "Вовлечённость"}: ${formatDateRange(dateRange)}`} onMouseMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(bucketCount - 1, Math.round((event.clientX - bounds.left) / bounds.width * (bucketCount - 1))))); }}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef7956" stopOpacity=".17"/><stop offset="100%" stopColor="#ef7956" stopOpacity="0"/></linearGradient></defs>
          {[12, 57, 102, 147, 192].map((y) => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#e9ece5" strokeDasharray="3 5"/>)}
          <path d={`${curve} L 800 205 L 0 205 Z`} fill={`url(#${gradientId})`}/>
          <path d={previousCurve} fill="none" stroke="#c9cfc1" strokeWidth="2" strokeDasharray="5 6"/>
          <path className="chart-line" d={curve} fill="none" stroke="#eb805d" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
          {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r="4" fill="#eb805d"/>}
          {current && <><line x1={current.x} x2={current.x} y1="0" y2="205" stroke="#d7b9a4" strokeDasharray="3 4"/><circle cx={current.x} cy={current.y} r="5" fill="#ef7956" stroke="white" strokeWidth="3"/></>}
        </svg>
        {current && hover !== null && <div className="pointer-events-none absolute -top-1 rounded-lg bg-ink px-2.5 py-1.5 text-[10px] text-white shadow-md" style={{ left: `${Math.min(81, Math.max(1, current.x / 8 - 5))}%` }}>{formatDate(buckets[hover].from, true)}{buckets[hover].from !== buckets[hover].to ? ` — ${formatDate(buckets[hover].to, true)}` : ""}: {valueLabel(values[hover])}</div>}
        <div className="mt-3 flex justify-between text-[9px] text-[#9ca294]">{Array.from({ length: Math.min(5, days) }, (_, index) => <span key={index}>{formatDate(shiftDate(dateRange.from, Math.round(index * (days - 1) / Math.max(1, Math.min(5, days) - 1))), true)}</span>)}</div>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-5 border-t border-border/70 pt-4 text-[9px] text-muted"><span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-accent"/>Текущий период</span><span className="inline-flex items-center gap-2"><span className="w-4 border-t border-dashed border-[#b9c0ae]"/>Предыдущий период</span></div>
  </div>;
}

export default function Dashboard() {
  const { dateRange, toast } = useWorkspace();
  const [accounts] = useCompetitorAccounts();
  const [metric, setMetric] = useState<"views" | "er">("views");
  const [selected, setSelected] = useState<number | null>(null);
  const sourceVideos = demoVideos.filter((video) => accounts.some((account) => account.handle === video.account && account.platform === video.platform));
  const videos = filterVideosByDateRange(dateRange, sourceVideos);
  const totals = summarizeVideos(videos);
  const previous = summarizeVideos(filterVideosByDateRange(previousDateRange(dateRange), sourceVideos));
  const totalViews = totals.views;
  const periodLabel = formatDateRange(dateRange);
  const change = (current: number, before: number) => before ? `${current >= before ? "+" : ""}${((current - before) / before * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%` : "нет данных";
  const publications = [...videos].sort((a, b) => b.views - a.views).slice(0, 3).map((video, index) => ({ ...video, account: `@${video.account}`, views: compact(video.views), er: `${summarizeVideos([video]).er.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`, duration: `0:${String(video.duration).padStart(2, "0")}`, variant: index, idea: publicationExamples.find((example) => example.title === video.title)?.idea ?? `Публикация на тему «${video.topic}» от ${formatDate(video.date)}. Изучите подачу и структуру, чтобы подготовить свою историю.` }));
  const selectedPublication = selected === null ? null : publications[selected] ?? null;
  const topics = Object.entries(videos.reduce<Record<string, number>>((result, video) => { result[video.topic] = (result[video.topic] ?? 0) + video.comments; return result; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([title, count], index) => ({ title, count: `${Math.round(count / (totals.comments || 1) * 100)}%`, width: `${count / (totals.comments || 1) * 100}%`, color: ["#a1b58c", "#e3b798", "#c6cbbc"][index] }));
  const tags = [...new Set(videos.flatMap((video) => video.tags))].slice(0, 4);
  const stats = [
    { label: "Всего просмотров", value: compact(totalViews), change: change(totalViews, previous.views), icon: "eye" },
    { label: "Вовлечённость · ER", value: totalViews ? `${totals.er.toLocaleString("ru-RU", {maximumFractionDigits: 1})}%` : "—", change: previous.views && totalViews ? `${totals.er >= previous.er ? "+" : ""}${(totals.er - previous.er).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} п.п.` : "нет данных", icon: "heart" },
    { label: "Видео в исследовании", value: String(totals.videos), change: change(totals.videos, previous.videos), icon: "video" },
    { label: "Комментариев у публикаций", value: compact(totals.comments), change: change(totals.comments, previous.comments), icon: "message" },
  ];
  function downloadOverview() {
    const text = `PLEEP·PEEP / SLOW COFFEE\nОбзор учебной выборки: ${periodLabel}\n\n${stats.map((stat) => `${stat.label}: ${stat.value}`).join("\n")}\n\n${accounts.length} демонстрационных аккаунтов TikTok и Instagram.\nER = (лайки + комментарии + репосты + сохранения) / просмотры × 100%.\n\nВсе показатели вымышлены и предназначены для демонстрации интерфейса.`;
    const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "pleep-peep-overview.txt"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("Обзор скачан в текстовом формате");
  }
  return <>
    <PageHeading eyebrow="СОБИРАЕМ СИГНАЛЫ. НАХОДИМ СМЫСЛЫ." title="Обзор проекта" description="Ваш контент, на шаг впереди. Посмотрим, что привлекло внимание аудитории.">
      <button onClick={downloadOverview} className="btn btn-secondary"><Icon name="download" size={16}/>Скачать обзор</button>
    </PageHeading>
    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      {stats.map((stat) => <Panel key={stat.label} className="relative overflow-hidden p-4 sm:p-5"><div className="mb-5 flex items-center justify-between gap-2"><span className="text-[11px] text-muted">{stat.label}</span><Icon name={stat.icon} size={17} className="text-[#b2b9a9]"/></div><p className="text-[27px] leading-none font-semibold tracking-[-1px] sm:text-[31px]">{stat.value}</p><div className="mt-4 flex items-center gap-1 text-[9px] text-positive"><span className={`font-semibold ${stat.change.startsWith("-") ? "text-[#ad503b]" : ""}`}>{stat.change}</span><span className="ml-1 hidden text-[#a0a697] sm:inline">к пред. периоду</span></div></Panel>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(270px,1fr)]">
      <Panel className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[16px] font-semibold tracking-tight">Как меняется внимание</h2><p className="mt-1.5 text-[10px] text-muted">Все платформы · аккаунтов: {accounts.length} · {periodLabel}</p></div><div className="flex rounded-lg bg-canvas p-1 text-[10px]">{([{ key: "views", name: "Просмотры" }, { key: "er", name: "ER" }] as const).map((item) => <button key={item.key} aria-pressed={metric === item.key} onClick={() => setMetric(item.key)} className={`rounded-md px-3 py-1.5 transition-colors ${metric === item.key ? "bg-white font-semibold text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{item.name}</button>)}</div></div>
        {totalViews ? <TrendChart key={`${dateRange.from}-${dateRange.to}`} metric={metric} dateRange={dateRange} videos={sourceVideos}/> : <EmptyState title="Пока нет показателей" description="За выбранные даты нет публикаций. Выберите другой период в календаре."/>}
      </Panel>
      <section className="relative flex flex-col overflow-hidden rounded-[22px] bg-[#fae6d9] p-6">
        <div className="mb-5 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9bd9f] px-2.5 py-1 text-[9px] font-semibold tracking-wider text-[#a46644]"><Icon name="sparkles" size={12}/>PLEEP ЗАМЕТИЛ</span><Icon name="sparkles" size={25} className="text-[#d48657]"/></div>
        <h2 className="max-w-[270px] text-[26px] leading-[1.22] font-semibold tracking-[-1px]">Покажите процесс.<br/>Он интереснее,<br/>чем кажется.</h2>
        <p className="mt-4 max-w-xs text-[11px] leading-[1.9] text-[#96795f]">Идея для следующего ролика: покажите процесс приготовления напитка и людей за кофейной стойкой.</p>
        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-white/55 p-3 text-[10px] leading-5 text-[#88694f]"><Icon name="coffee" size={19} className="mt-1 shrink-0"/><span>Попробуйте снять, как рождается ваш фирменный напиток.</span></div>
        <Link href="/ai-studio" className="mt-5 flex items-center justify-between border-t border-[#ebcbb5] pt-4 text-xs font-semibold text-[#8b5033]">Превратить в сценарий<Icon name="arrow-up-right" size={17}/></Link>
      </section>
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(270px,1fr)]">
      <Panel className="min-w-0 p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[16px] font-semibold tracking-tight">Контент, который заметили</h2><p className="mt-1.5 text-[10px] text-muted">Публикации с наибольшими просмотрами за выбранный период</p></div><Link href="/competitors" className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted hover:text-accent">Все конкуренты<Icon name="arrow-right" size={13}/></Link></div>
        <div className="grid gap-5 sm:grid-cols-3">{publications.map((publication, index) => <button key={publication.title} onClick={() => setSelected(index)} className="group min-w-0 text-left" aria-label={`Открыть карточку: ${publication.title}`}><div className="relative h-[150px] overflow-hidden rounded-xl bg-soft transition-transform group-hover:-translate-y-1 sm:h-[126px] 2xl:h-[157px]"><CoffeePoster variant={publication.variant}/><span className="absolute right-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 text-[8px] text-white">{publication.duration}</span><span className="absolute top-2 left-2"><PlatformBadge platform={publication.platform} compact/></span></div><p className="mt-3 text-[9px] text-muted">{publication.account}</p><h3 className="mt-1.5 min-h-9 text-[11px] leading-[1.6] font-semibold group-hover:text-accent">{publication.title}</h3><div className="mt-3 flex items-center justify-between text-[9px] text-muted"><span className="inline-flex items-center gap-1"><Icon name="eye" size={12}/>{publication.views}</span><span className="font-medium text-positive">ER {publication.er}</span></div></button>)}</div>{!publications.length && <p className="py-6 text-xs text-muted">В этом периоде публикаций нет.</p>}
      </Panel>
      <Panel className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-[16px] font-semibold tracking-tight">О чём говорят</h2><span className="badge">ТОП-3</span></div><div className="space-y-5">{topics.map((topic) => <div key={topic.title}><div className="mb-2 flex justify-between text-[10px]"><span className="text-[#6f7768]">{topic.title}</span><span className="font-medium">{topic.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full" style={{ width: topic.width, background: topic.color }}/></div></div>)}</div><div className="mt-6 border-t border-border pt-4"><p className="mb-3 text-[9px] font-semibold tracking-wide text-muted">ХЕШТЕГИ В ФОКУСЕ</p><div className="flex flex-wrap gap-2">{tags.map((tag) => <Link key={tag} href="/ai-studio" className="rounded-md bg-canvas px-2 py-1.5 text-[9px] text-[#7b856f] hover:bg-[#e8eddc]">{tag}</Link>)}</div></div></Panel>
    </div>
    <p className="mt-5 flex items-start gap-2 text-[9px] leading-5 text-[#969d8e]"><Icon name="info" size={13} className="mt-0.5 shrink-0"/><span>Все аккаунты и показатели вымышлены. ER = (лайки + комментарии + репосты + сохранения) / просмотры × 100%. Источник: учебная выборка, август — октябрь 2026.</span></p>
    <Modal open={selectedPublication !== null} onClose={() => setSelected(null)} title={selectedPublication?.title ?? "Публикация"} description="Карточка демонстрационной публикации">
      {selectedPublication && <><div className="h-60 overflow-hidden rounded-2xl"><CoffeePoster variant={selectedPublication.variant}/></div><div className="mt-5 flex items-center justify-between"><PlatformBadge platform={selectedPublication.platform}/><span className="text-xs text-muted">{selectedPublication.account}</span></div><p className="mt-5 text-sm leading-7 text-muted">{selectedPublication.idea}</p><div className="mt-5 flex gap-6 rounded-xl bg-canvas p-4"><div><p className="text-[10px] text-muted">Просмотры</p><p className="mt-1 text-lg font-semibold">{selectedPublication.views}</p></div><div><p className="text-[10px] text-muted">Вовлечённость</p><p className="mt-1 text-lg font-semibold">{selectedPublication.er}</p></div></div><Link href="/ai-studio" onClick={() => setSelected(null)} className="btn btn-primary mt-6 w-full">Создать свою историю<Icon name="arrow-right" size={16}/></Link></>}
    </Modal>
  </>;
}
