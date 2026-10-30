"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useCompetitorAccounts, type Account } from "@/components/competitor-context";
import { EmptyState, Icon, Modal, PageHeading, Panel, PlatformBadge } from "@/components/ui";

type Platform = "TikTok" | "Instagram";
type SortKey = "followers" | "videos" | "views" | "er";

const compact = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const integer = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("ru-RU").format(value);
const rate = (account: Account) => account.views && account.interactions !== null ? account.interactions / account.views * 100 : null;
const rateLabel = (value: number | null) => value === null ? "—" : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;

function Sparkline({ variant = 0 }: { variant?: number }) {
  const lines = ["1,27 9,24 17,26 25,17 33,19 41,11 49,13 57,5 67,2", "1,28 9,26 17,17 25,22 33,12 41,15 49,7 57,9 67,1", "1,26 9,22 17,24 25,21 33,15 41,17 49,10 57,12 67,4"];
  return <svg aria-hidden="true" viewBox="0 0 70 32" className="h-8 w-[70px] shrink-0"><polyline points={lines[variant % lines.length]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function CompetitorsPage() {
  const { period, toast } = useWorkspace();
  const [accounts, setAccounts] = useCompetitorAccounts();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [sort, setSort] = useState<SortKey>("views");
  const [descending, setDescending] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Account | null>(null);
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [newPlatform, setNewPlatform] = useState<Platform>("Instagram");
  const [formError, setFormError] = useState("");
  const multiplier = period === "7" ? 0.27 : period === "90" ? 2.65 : 1;
  const scaled = (value: number | null) => value === null ? null : Math.round(value * multiplier);
  const totalViews = accounts.reduce((sum, item) => sum + (scaled(item.views) ?? 0), 0);
  const totalVideos = accounts.reduce((sum, item) => sum + (scaled(item.videos) ?? 0), 0);
  const totalInteractions = accounts.reduce((sum, item) => sum + (scaled(item.interactions) ?? 0), 0);
  const platformCount = new Set(accounts.map((account) => account.platform)).size;

  const visibleAccounts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("ru-RU");
    return accounts.filter((item) => (platform === "all" || item.platform === platform) && `${item.name} ${item.handle}`.toLocaleLowerCase("ru-RU").includes(search)).sort((first, second) => {
      const a = sort === "er" ? rate(first) : first[sort];
      const b = sort === "er" ? rate(second) : second[sort];
      if (a === null) return b === null ? 0 : 1;
      if (b === null) return -1;
      return descending ? b - a : a - b;
    });
  }, [accounts, query, platform, sort, descending]);

  function toggleSort(key: SortKey) {
    if (sort === key) setDescending(!descending);
    else { setSort(key); setDescending(true); }
  }

  function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanHandle = handle.trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9._]{2,30}$/.test(cleanHandle)) { setFormError("Введите имя аккаунта: 2–30 латинских букв, цифр, точек или подчёркиваний."); return; }
    if (accounts.some((item) => item.handle.toLowerCase() === cleanHandle.toLowerCase() && item.platform === newPlatform)) { setFormError("Этот аккаунт уже есть в вашем списке."); return; }
    const displayName = name.trim() || cleanHandle;
    setAccounts((previous) => [...previous, { id: `local-${Date.now()}`, name: displayName, handle: cleanHandle, platform: newPlatform, followers: null, videos: null, views: null, interactions: null, growth: null, initials: displayName.slice(0, 2).toLowerCase(), color: "bg-soft text-ink", category: "Добавлен вручную" }]);
    setAddOpen(false); setHandle(""); setName(""); setFormError(""); setPlatform("all"); setQuery("");
    toast(`@${cleanHandle} добавлен в список конкурентов`);
  }

  function sortHeading(label: string, key: SortKey) {
    return <button type="button" onClick={() => toggleSort(key)} className={`inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-ink ${sort === key ? "text-ink" : "text-muted"}`} aria-label={`Сортировать: ${label.toLowerCase()}`}><span>{label}</span><span aria-hidden="true" className={sort === key ? "text-accent" : "opacity-40"}>{sort === key && !descending ? "↑" : "↓"}</span></button>;
  }

  return (
    <div className="space-y-7">
      <PageHeading eyebrow="НАБЛЮДАТЬ, ЧТОБЫ ПОНИМАТЬ" title="Конкуренты" description="Смотрите шире. Находите закономерности. Создавайте своё.">
        <button type="button" className="btn btn-primary" onClick={() => { setFormError(""); setAddOpen(true); }}><Icon name="plus" size={17} />Добавить аккаунт</button>
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="flex items-center justify-between gap-4 p-5 sm:p-6"><div><p className="text-sm text-muted">Аккаунтов в проекте</p><div className="mt-2 flex items-baseline gap-2"><span className="text-[32px] font-semibold leading-none tracking-[-0.05em]">{accounts.length.toString().padStart(2, "0")}</span><span className="text-xs text-muted">платформ: {platformCount}</span></div></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee5] text-[#8d7d60]"><Icon name="users" size={21} /></span></Panel>
        <Panel className="flex items-center justify-between gap-4 p-5 sm:p-6"><div><p className="text-sm text-muted">Просмотров в выборке</p><div className="mt-2 flex items-baseline gap-2"><span className="text-[32px] font-semibold leading-none tracking-[-0.05em]">{compact(totalViews)}</span><span className="text-xs text-positive">за {period} дней</span></div></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e9] text-positive"><Icon name="eye" size={21} /></span></Panel>
        <Panel className="flex items-center justify-between gap-4 p-5 sm:p-6"><div><p className="text-sm text-muted">Средняя вовлечённость</p><div className="mt-2 flex items-baseline gap-2"><span className="text-[32px] font-semibold leading-none tracking-[-0.05em]">{rateLabel(totalViews ? totalInteractions / totalViews * 100 : null)}</span><span className="text-xs text-muted">по просмотрам</span></div></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Icon name="heart" size={21} /></span></Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-border px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5"><h2 className="text-lg font-semibold tracking-[-0.025em]">В поле зрения</h2><span className="rounded-md bg-soft px-2 py-0.5 text-xs font-medium text-muted">{accounts.length}</span></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-xl bg-canvas p-1" aria-label="Фильтр платформы">{(["all", "Instagram", "TikTok"] as const).map((item) => <button type="button" key={item} aria-pressed={platform === item} onClick={() => setPlatform(item)} className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${platform === item ? "bg-white text-ink shadow-[0_1px_4px_#252a2410]" : "text-muted hover:text-ink"}`}>{item === "all" ? "Все платформы" : item}</button>)}</div>
            <label className="relative block sm:w-[200px]"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"><Icon name="search" size={16} /></span><input className="input w-full !pl-9 !text-xs" aria-label="Поиск конкурентов" placeholder="Найти аккаунт…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          </div>
        </div>

        {visibleAccounts.length ? <div className="relative overflow-x-auto"><table className="w-full min-w-[870px] border-collapse text-left text-sm"><thead className="bg-canvas/60 text-[11px] font-medium"><tr><th scope="col" className="px-6 py-4 font-medium text-muted">Аккаунт</th><th scope="col" className="px-3 py-4 font-medium text-muted">Платформа</th><th scope="col" className="px-3 py-4 font-medium" aria-sort={sort === "followers" ? descending ? "descending" : "ascending" : "none"}>{sortHeading("Подписчики", "followers")}</th><th scope="col" className="px-3 py-4 font-medium" aria-sort={sort === "videos" ? descending ? "descending" : "ascending" : "none"}>{sortHeading("Видео", "videos")}</th><th scope="col" className="px-3 py-4 font-medium" aria-sort={sort === "views" ? descending ? "descending" : "ascending" : "none"}>{sortHeading("Просмотры", "views")}</th><th scope="col" className="px-3 py-4 font-medium" aria-sort={sort === "er" ? descending ? "descending" : "ascending" : "none"}>{sortHeading("ER", "er")}</th><th scope="col" className="px-3 py-4 font-medium text-muted">Динамика</th><th scope="col" className="w-12 px-4 py-4"><span className="sr-only">Подробнее</span></th></tr></thead><tbody>{visibleAccounts.map((account, index) => <tr key={account.id} className="group border-t border-border/80 transition-colors hover:bg-canvas/70"><th scope="row" className="px-6 py-5 font-normal"><button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelected(account)}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-xl font-semibold tracking-tight ${account.color}`}>{account.initials}</span><span><span className="block font-semibold tracking-[-0.01em] group-hover:text-accent">{account.name}</span><span className="mt-0.5 block text-xs text-muted">@{account.handle}</span></span></button></th><td className="px-3 py-5"><PlatformBadge platform={account.platform} compact /></td><td className="px-3 py-5 tabular-nums">{compact(account.followers)}</td><td className="px-3 py-5 tabular-nums text-muted">{integer(scaled(account.videos))}</td><td className="px-3 py-5 font-medium tabular-nums">{compact(scaled(account.views))}</td><td className="px-3 py-5"><span className={`rounded-lg px-2 py-1 text-xs font-medium tabular-nums ${rate(account) !== null && (rate(account) ?? 0) >= 7 ? "bg-[#edf4e9] text-positive" : "text-ink"}`}>{rateLabel(rate(account))}</span></td><td className="px-3 py-5">{account.growth === null ? <span className="text-muted">—</span> : <div className="flex items-center gap-2 text-positive"><Sparkline variant={index} /><span className="text-[11px] tabular-nums">+{account.growth.toLocaleString("ru-RU")}%</span></div>}</td><td className="px-4 py-5"><button type="button" onClick={() => setSelected(account)} aria-label={`Подробнее об аккаунте ${account.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink"><Icon name="arrow-up-right" size={17} /></button></td></tr>)}</tbody></table></div> : <div className="py-10"><EmptyState title="Здесь пока тихо" description="По вашему запросу аккаунты не найдены. Попробуйте другое имя или выберите все платформы."><button type="button" className="btn btn-secondary mt-4" onClick={() => { setQuery(""); setPlatform("all"); }}>Сбросить фильтры</button></EmptyState></div>}

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 text-[11px] leading-relaxed text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between"><span>Показано {visibleAccounts.length} из {accounts.length} аккаунтов · {integer(totalVideos)} видео в демо-выборке</span><span>Нажмите на название аккаунта, чтобы увидеть детали <span aria-hidden="true">↗</span></span></div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex items-start gap-4 rounded-[22px] border border-[#f1ddce] bg-[#fcf0e6] p-5 sm:p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-accent"><Icon name="sparkles" size={20} /></span><div className="min-w-0"><p className="section-kicker !text-[#b77e5f]">ЗАМЕЧЕНО В ВЫБОРКЕ</p><h3 className="mt-2 font-semibold tracking-[-0.02em]">Маленький ритуал — большой отклик</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-[#897460]">Короткие ролики о процессе приготовления кофе собирают больше сохранений. Попробуйте рассказать свою историю.</p><Link href="/ai-studio" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#8e573e] transition-colors hover:text-ink">Превратить наблюдение в идею<Icon name="arrow-right" size={15} /></Link></div></div>
        <div className="px-1 py-2 sm:px-2"><div className="flex items-center gap-2 text-xs font-medium text-ink"><Icon name="info" size={15} />Как читать эти цифры</div><p className="mt-3 text-xs leading-6 text-muted">Демонстрационные данные за последние {period} дней. Аккаунты и показатели вымышлены. Для добавленных аккаунтов метрики появятся только при наличии данных.</p><p className="mt-2 text-[11px] leading-5 text-muted">ER = (лайки + комментарии + репосты + сохранения) / просмотры × 100%. Динамика — изменение просмотров относительно предыдущего равного периода.</p></div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Добавить конкурента" description="Сохраните аккаунт, за которым хотите наблюдать.">
        <form onSubmit={addAccount} className="space-y-5"><div><label htmlFor="competitor-platform" className="field-label">Платформа</label><select id="competitor-platform" className="input mt-2 w-full" value={newPlatform} onChange={(event) => setNewPlatform(event.target.value as Platform)}><option>Instagram</option><option>TikTok</option></select></div><div><label htmlFor="competitor-handle" className="field-label">Имя аккаунта <span className="text-accent">*</span></label><input id="competitor-handle" className="input mt-2 w-full" placeholder="@coffee.example" value={handle} onChange={(event) => { setHandle(event.target.value); setFormError(""); }} required autoComplete="off" maxLength={31} aria-describedby={formError ? "competitor-error" : "competitor-handle-help"} /><p id="competitor-handle-help" className="mt-2 text-xs text-muted">Введите имя без ссылки на профиль.</p></div><div><label htmlFor="competitor-name" className="field-label">Название <span className="font-normal text-muted">· необязательно</span></label><input id="competitor-name" className="input mt-2 w-full" placeholder="Как называется кофейня?" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} /></div>{formError && <p id="competitor-error" role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs leading-relaxed text-[#ad503b]">{formError}</p>}<p className="rounded-xl bg-canvas p-3 text-xs leading-relaxed text-muted">Аккаунт будет добавлен без показателей: этот прототип не загружает данные из социальных сетей.</p><div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>Отмена</button><button type="submit" className="btn btn-primary"><Icon name="plus" size={16} />Добавить аккаунт</button></div></form>
      </Modal>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? "Аккаунт"} description={selected ? `@${selected.handle} · ${selected.category}` : ""}>
        {selected && <div className="space-y-5"><div className="flex items-center justify-between"><PlatformBadge platform={selected.platform} /><span className="text-xs text-muted">За последние {period} дней</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[{ label: "Просмотры", value: compact(scaled(selected.views)) }, { label: "Подписчики", value: compact(selected.followers) }, { label: "Видео", value: integer(scaled(selected.videos)) }, { label: "Лайки", value: compact(selected.interactions === null ? null : scaled(Math.round(selected.interactions * 0.82))) }, { label: "Комментарии", value: compact(selected.interactions === null ? null : scaled(Math.round(selected.interactions * 0.07))) }, { label: "ER по просмотрам", value: rateLabel(rate(selected)) }].map((item) => <div className="rounded-2xl bg-canvas p-4" key={item.label}><p className="text-[11px] text-muted">{item.label}</p><p className="mt-2 text-xl font-semibold tracking-tight">{item.value}</p></div>)}</div>{selected.views === null ? <p className="rounded-2xl border border-dashed border-border p-5 text-sm leading-relaxed text-muted">Аккаунт сохранён. Для анализа пока нет исходных публикаций и метрик.</p> : <div className="rounded-2xl bg-[#edf2e9] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-positive"><Icon name="chart" size={17} />Что выделяется</div><p className="mt-2 text-sm leading-relaxed text-[#6c7868]">У этого аккаунта хорошо работают короткие истории о кофе: процесс, люди и небольшие повседневные ритуалы.</p></div>}<p className="text-[11px] leading-relaxed text-muted">Демо-данные. ER = сумма лайков, комментариев, репостов и сохранений / просмотры × 100%.</p><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><button type="button" className="btn btn-ghost !px-0 !text-[#af6553]" onClick={() => { setAccounts((previous) => previous.filter((account) => account.id !== selected.id)); setSelected(null); toast("Аккаунт удалён из списка"); }}><Icon name="trash" size={15} />Убрать из списка</button><Link href="/ai-studio" className="btn btn-primary"><Icon name="sparkles" size={16} />В AI-студию</Link></div></div>}
      </Modal>
    </div>
  );
}
