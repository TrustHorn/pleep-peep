"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useWorkspace } from "./app-shell";
import { useCompetitorAccounts } from "./competitor-context";
import { EmptyState, Icon, Modal, PageHeading, Panel, PlatformBadge } from "./ui";

const publications = [
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
const series = [49, 53, 50, 66, 59, 83, 75, 95, 89, 106, 104, 132, 108, 155, 142];

function TrendChart({ metric, period, totalViews, totalEr }: { metric: "views" | "er"; period: string; totalViews: number; totalEr: number }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const factor = period === "7" ? .27 : period === "90" ? 2.65 : 1;
  const seriesTotal = series.reduce((sum, value) => sum + value, 0);
  const values = series.map((value) => metric === "views" ? value / seriesTotal * totalViews : Math.max(0, totalEr + (value - seriesTotal / series.length) / 35));
  const step = metric === "views" ? 60000 * factor : 2.5;
  const domain = Math.max(step * 4, Math.ceil(Math.max(...values) / step) * step);
  const coordinates = (data: number[]) => data.map((value, index) => ({ x: index * 800 / 14, y: 195 - value / domain * 180 }));
  const points = coordinates(values);
  const pathFor = (data: typeof points) => data.reduce((path, point, index) => {
    if (!index) return `M ${point.x} ${point.y}`;
    const previous = data[index - 1];
    const bend = (point.x - previous.x) * .5;
    return `${path} C ${previous.x + bend} ${previous.y},${point.x - bend} ${point.y},${point.x} ${point.y}`;
  }, "");
  const curve = pathFor(points);
  const previousCurve = pathFor(coordinates(values.map((value, index) => value * (.68 + index % 3 * .035))));
  const valueLabel = (value: number) => metric === "views" ? compact(value) : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
  const current = hover === null ? null : points[hover];
  return <div className="mt-6">
    <div className="flex gap-3"><div className="flex h-[192px] w-9 shrink-0 flex-col justify-between pb-1 text-[9px] text-[#9ca294]">{[1, .75, .5, .25, 0].map((fraction) => <span key={fraction}>{valueLabel(domain * fraction)}</span>)}</div>
      <div className="relative min-w-0 flex-1" onMouseLeave={() => setHover(null)}>
        <svg viewBox="0 0 800 210" preserveAspectRatio="none" className="h-[195px] w-full overflow-visible" role="img" aria-label={metric === "views" ? `Демонстрационная динамика просмотров за ${period} дней, восходящий тренд` : "Демонстрационная динамика вовлечённости"} onMouseMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(14, Math.round((event.clientX - bounds.left) / bounds.width * 14)))); }}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef7956" stopOpacity=".17"/><stop offset="100%" stopColor="#ef7956" stopOpacity="0"/></linearGradient></defs>
          {[12, 57, 102, 147, 192].map((y) => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#e9ece5" strokeDasharray="3 5"/>)}
          <path d={`${curve} L 800 205 L 0 205 Z`} fill={`url(#${gradientId})`}/>
          <path d={previousCurve} fill="none" stroke="#c9cfc1" strokeWidth="2" strokeDasharray="5 6"/>
          <path className="chart-line" d={curve} fill="none" stroke="#eb805d" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
          {current && <><line x1={current.x} x2={current.x} y1="0" y2="205" stroke="#d7b9a4" strokeDasharray="3 4"/><circle cx={current.x} cy={current.y} r="5" fill="#ef7956" stroke="white" strokeWidth="3"/></>}
        </svg>
        {current && hover !== null && <div className="pointer-events-none absolute -top-1 rounded-lg bg-ink px-2.5 py-1.5 text-[10px] text-white shadow-md" style={{ left: `${Math.min(81, Math.max(1, current.x / 8 - 5))}%` }}>{valueLabel(values[hover])}</div>}
        <div className="mt-3 flex justify-between text-[9px] text-[#9ca294]">{(period === "7" ? ["24 окт", "25", "26", "27", "28", "29", "30 окт"] : period === "90" ? ["2 авг", "17", "1 сен", "16", "1 окт", "16", "30 окт"] : ["1 окт", "6", "11", "16", "21", "26", "30 окт"]).map((label, i) => <span key={i}>{label}</span>)}</div>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-5 border-t border-border/70 pt-4 text-[9px] text-muted"><span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-accent"/>Текущий период</span><span className="inline-flex items-center gap-2"><span className="w-4 border-t border-dashed border-[#b9c0ae]"/>Предыдущий период</span></div>
  </div>;
}

export default function Dashboard() {
  const { period, toast } = useWorkspace();
  const [accounts] = useCompetitorAccounts();
  const [metric, setMetric] = useState<"views" | "er">("views");
  const [selected, setSelected] = useState<number | null>(null);
  const factor = period === "7" ? .27 : period === "90" ? 2.65 : 1;
  const scaled = (value: number | null) => Math.round((value ?? 0) * factor);
  const totalViews = accounts.reduce((sum, account) => sum + scaled(account.views), 0);
  const totalVideos = accounts.reduce((sum, account) => sum + scaled(account.videos), 0);
  const totalInteractions = accounts.reduce((sum, account) => sum + scaled(account.interactions), 0);
  const totalComments = accounts.reduce((sum, account) => sum + scaled(account.interactions === null ? null : Math.round(account.interactions * .07)), 0);
  const totalEr = totalViews ? totalInteractions / totalViews * 100 : 0;
  const stats = [
    { label: "Всего просмотров", value: totalViews ? compact(totalViews) : "—", change: "+18,6%", icon: "eye", color: "#ef7956", line: "0,28 8,24 17,25 26,15 36,20 45,10 54,13 65,2" },
    { label: "Вовлечённость · ER", value: totalViews ? `${totalEr.toLocaleString("ru-RU", {maximumFractionDigits: 1})}%` : "—", change: "+1,2 п.п.", icon: "heart", color: "#799864", line: "0,28 8,25 17,28 26,18 36,17 45,10 54,14 65,4" },
    { label: "Видео в исследовании", value: totalVideos ? String(totalVideos) : "—", change: "+24,5%", icon: "video", color: "#b49b75", line: "0,27 8,27 17,20 26,20 36,14 45,14 54,5 65,5" },
    { label: "Изучено комментариев", value: totalViews ? compact(totalComments) : "—", change: "+12,8%", icon: "message", color: "#829ba0", line: "0,28 8,19 17,21 26,14 36,17 45,7 54,9 65,2" },
  ];
  function downloadOverview() {
    const text = `PLEEP·PEEP / SLOW COFFEE\nОбзор учебной выборки за ${period} дней\n\n${stats.map((stat) => `${stat.label}: ${stat.value}`).join("\n")}\n\n${accounts.length} демонстрационных аккаунтов TikTok и Instagram.\nER = (лайки + комментарии + репосты + сохранения) / просмотры × 100%.\n\nНаблюдение: в учебной выборке хорошо работают короткие истории о процессе приготовления кофе.\nРекомендация: протестировать ролик о кофейном ритуале.\n\nВсе показатели вымышлены и предназначены для демонстрации интерфейса.`;
    const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "pleep-peep-overview.txt"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("Обзор скачан в текстовом формате");
  }
  return <>
    <PageHeading eyebrow="СОБИРАЕМ СИГНАЛЫ. НАХОДИМ СМЫСЛЫ." title="Обзор проекта" description="Ваш контент, на шаг впереди. Посмотрим, что привлекло внимание аудитории.">
      <button onClick={downloadOverview} className="btn btn-secondary"><Icon name="download" size={16}/>Скачать обзор</button>
    </PageHeading>
    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      {stats.map((stat) => <Panel key={stat.label} className="relative overflow-hidden p-4 sm:p-5"><div className="mb-5 flex items-center justify-between gap-2"><span className="text-[11px] text-muted">{stat.label}</span><Icon name={stat.icon} size={17} className="text-[#b2b9a9]"/></div><p className="text-[27px] leading-none font-semibold tracking-[-1px] sm:text-[31px]">{stat.value}</p><div className="mt-4 flex items-center gap-1 text-[9px] text-positive"><Icon name="arrow-up-right" size={11}/><span className="font-semibold">{stat.change}</span><span className="ml-1 hidden text-[#a0a697] sm:inline">к пред. периоду</span></div><svg viewBox="0 0 68 34" width="62" height="32" fill="none" className="absolute right-4 bottom-5 hidden sm:block" aria-hidden="true"><polyline points={stat.line} stroke={stat.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></Panel>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(270px,1fr)]">
      <Panel className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[16px] font-semibold tracking-tight">Как меняется внимание</h2><p className="mt-1.5 text-[10px] text-muted">Все платформы · аккаунтов: {accounts.length} · {period} дней</p></div><div className="flex rounded-lg bg-canvas p-1 text-[10px]">{([{ key: "views", name: "Просмотры" }, { key: "er", name: "ER" }] as const).map((item) => <button key={item.key} aria-pressed={metric === item.key} onClick={() => setMetric(item.key)} className={`rounded-md px-3 py-1.5 transition-colors ${metric === item.key ? "bg-white font-semibold text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{item.name}</button>)}</div></div>
        {totalViews ? <TrendChart metric={metric} period={period} totalViews={totalViews} totalEr={totalEr}/> : <EmptyState title="Пока нет показателей" description="Добавьте аккаунты с исходными метриками. Пустые значения не заменяются предположениями."/>}
      </Panel>
      <section className="relative flex flex-col overflow-hidden rounded-[22px] bg-[#fae6d9] p-6">
        <div className="mb-5 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9bd9f] px-2.5 py-1 text-[9px] font-semibold tracking-wider text-[#a46644]"><Icon name="sparkles" size={12}/>PLEEP ЗАМЕТИЛ</span><Icon name="sparkles" size={25} className="text-[#d48657]"/></div>
        <h2 className="max-w-[270px] text-[26px] leading-[1.22] font-semibold tracking-[-1px]">Покажите процесс.<br/>Он интереснее,<br/>чем кажется.</h2>
        <p className="mt-4 max-w-xs text-[11px] leading-[1.9] text-[#96795f]">В учебной выборке закулисье кофейни получает на 38% больше сохранений, чем обычные фотографии напитков.</p>
        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-white/55 p-3 text-[10px] leading-5 text-[#88694f]"><Icon name="coffee" size={19} className="mt-1 shrink-0"/><span>Попробуйте снять, как рождается ваш фирменный напиток.</span></div>
        <Link href="/ai-studio" className="mt-5 flex items-center justify-between border-t border-[#ebcbb5] pt-4 text-xs font-semibold text-[#8b5033]">Превратить в сценарий<Icon name="arrow-up-right" size={17}/></Link>
      </section>
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(270px,1fr)]">
      <Panel className="min-w-0 p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[16px] font-semibold tracking-tight">Контент, который заметили</h2><p className="mt-1.5 text-[10px] text-muted">Три идеи из демонстрационной выборки</p></div><Link href="/competitors" className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted hover:text-accent">Все конкуренты<Icon name="arrow-right" size={13}/></Link></div>
        <div className="grid gap-5 sm:grid-cols-3">{publications.map((publication, index) => <button key={publication.title} onClick={() => setSelected(index)} className="group min-w-0 text-left" aria-label={`Открыть карточку: ${publication.title}`}><div className="relative h-[150px] overflow-hidden rounded-xl bg-soft transition-transform group-hover:-translate-y-1 sm:h-[126px] 2xl:h-[157px]"><CoffeePoster variant={publication.variant}/><span className="absolute right-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 text-[8px] text-white">{publication.duration}</span><span className="absolute top-2 left-2"><PlatformBadge platform={publication.platform} compact/></span></div><p className="mt-3 text-[9px] text-muted">{publication.account}</p><h3 className="mt-1.5 min-h-9 text-[11px] leading-[1.6] font-semibold group-hover:text-accent">{publication.title}</h3><div className="mt-3 flex items-center justify-between text-[9px] text-muted"><span className="inline-flex items-center gap-1"><Icon name="eye" size={12}/>{publication.views}</span><span className="font-medium text-positive">ER {publication.er}</span></div></button>)}</div>
      </Panel>
      <Panel className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-[16px] font-semibold tracking-tight">О чём говорят</h2><span className="badge">ТОП-3</span></div><div className="space-y-5">{[{ title: "Кофейные ритуалы", count: "42%", width: "42%", color: "#a1b58c" }, { title: "Люди за стойкой", count: "31%", width: "31%", color: "#e3b798" }, { title: "Как выбрать кофе", count: "27%", width: "27%", color: "#c6cbbc" }].map((topic) => <div key={topic.title}><div className="mb-2 flex justify-between text-[10px]"><span className="text-[#6f7768]">{topic.title}</span><span className="font-medium">{topic.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full" style={{ width: topic.width, background: topic.color }}/></div></div>)}</div><div className="mt-6 border-t border-border pt-4"><p className="mb-3 text-[9px] font-semibold tracking-wide text-muted">ХЕШТЕГИ В ФОКУСЕ</p><div className="flex flex-wrap gap-2">{["#coffeetime", "#бариста", "#slowmorning", "#кофеалматы"].map((tag) => <Link key={tag} href="/ai-studio" className="rounded-md bg-canvas px-2 py-1.5 text-[9px] text-[#7b856f] hover:bg-[#e8eddc]">{tag}</Link>)}</div></div></Panel>
    </div>
    <p className="mt-5 flex items-start gap-2 text-[9px] leading-5 text-[#969d8e]"><Icon name="info" size={13} className="mt-0.5 shrink-0"/><span>Все аккаунты и показатели вымышлены. ER = (лайки + комментарии + репосты + сохранения) / просмотры × 100%. Источник: учебная выборка, август — октябрь 2026.</span></p>
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected !== null ? publications[selected].title : "Публикация"} description="Карточка демонстрационной публикации">
      {selected !== null && <><div className="h-60 overflow-hidden rounded-2xl"><CoffeePoster variant={publications[selected].variant}/></div><div className="mt-5 flex items-center justify-between"><PlatformBadge platform={publications[selected].platform}/><span className="text-xs text-muted">{publications[selected].account}</span></div><p className="mt-5 text-sm leading-7 text-muted">{publications[selected].idea}</p><div className="mt-5 flex gap-6 rounded-xl bg-canvas p-4"><div><p className="text-[10px] text-muted">Просмотры</p><p className="mt-1 text-lg font-semibold">{publications[selected].views}</p></div><div><p className="text-[10px] text-muted">Вовлечённость</p><p className="mt-1 text-lg font-semibold">{publications[selected].er}</p></div></div><Link href="/ai-studio" onClick={() => setSelected(null)} className="btn btn-primary mt-6 w-full">Создать свою историю<Icon name="arrow-right" size={16}/></Link></>}
    </Modal>
  </>;
}
