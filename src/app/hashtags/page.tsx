"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useUserState } from "@/components/auth-context";
import { Icon, PageHeading, Panel } from "@/components/ui";
import { compactNumber, demoHashtags, percent } from "@/lib/demo-data";

type SortKey = "avgViews" | "er" | "posts" | "niche";
const sortLabels: Record<SortKey, string> = { avgViews: "Средние просмотры", er: "ER", posts: "Публикации", niche: "Соответствие нише" };

export default function HashtagsPage() {
  const { toast } = useWorkspace();
  const [sort, setSort] = useState<SortKey>("avgViews");
  const [picked, setPicked] = useUserState<string[]>("hashtags-picked", []);
  const [sets, setSets] = useUserState<{ name: string; tags: string[] }[]>("hashtags-sets", [{ name: "Утро в кофейне", tags: ["#slowmorning", "#бариста", "#кофеалматы"] }]);
  const [setName, setSetName] = useUserState("hashtags-set-name", "");
  const [lookup, setLookup] = useState("");
  const [note, setNote] = useState("");

  const rows = [...demoHashtags].sort((a, b) => b[sort] - a[sort]);
  const toggle = (tag: string) => setPicked((previous) => previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag]);

  function saveSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked.length) { toast("Сначала отметьте хотя бы один хештег"); return; }
    const name = setName.trim() || `Набор ${sets.length + 1}`;
    setSets((previous) => [...previous, { name, tags: picked }]);
    setPicked([]); setSetName("");
    toast(`Набор «${name}» сохранён в этом браузере`);
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tag = lookup.trim().replace(/^#?/, "#").toLowerCase();
    const found = demoHashtags.find((item) => item.tag.toLowerCase() === tag);
    setNote(found ? `${found.tag} уже есть в выборке: ${found.posts} публикаций.` : `${tag}: в демонстрационной выборке данных нет. Прототип не загружает публикации из соцсетей.`);
  }

  return <>
    <PageHeading eyebrow="ТЕМЫ И МЕТКИ" title="Анализ хештегов" description="Какие метки встречаются в публикациях выборки и насколько они подходят вашей нише."/>
    <form onSubmit={search} className="mb-5 flex max-w-xl gap-2"><label className="relative flex-1"><span className="sr-only">Хештег для проверки</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"><Icon name="hash" size={15}/></span><input className="input !pl-9" placeholder="Проверить хештег, например кофе" value={lookup} onChange={(event) => { setLookup(event.target.value); setNote(""); }}/></label><button className="btn btn-primary" type="submit" disabled={!lookup.trim()}>Проверить</button></form>
    {note && <p role="status" className="mb-5 rounded-xl bg-canvas p-3 text-xs text-muted">{note}</p>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
      <Panel className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><h2 className="text-base font-semibold tracking-tight">Хештеги в выборке</h2><label className="flex items-center gap-2 text-xs"><span className="text-muted">Сортировка</span><select className="input !w-auto !py-2 !text-xs" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>{Object.entries(sortLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr><th className="w-12 px-5 py-3"><span className="sr-only">Выбрать</span></th>{["Хештег", "Публикации", "Ср. просмотры", "ER", "Ниша"].map((heading) => <th key={heading} scope="col" className="px-3 py-3 font-medium">{heading}</th>)}</tr></thead>
          <tbody>{rows.map((item) => <tr key={item.tag} className="border-t border-border/80 hover:bg-canvas/70"><td className="px-5 py-4"><input type="checkbox" aria-label={`Выбрать ${item.tag}`} checked={picked.includes(item.tag)} onChange={() => toggle(item.tag)}/></td><th scope="row" className="px-3 font-semibold">{item.tag}<span className="mt-0.5 block text-[10px] font-normal text-muted">часто вместе: {item.related.join(", ")}</span></th><td className="px-3 tabular-nums">{item.posts}</td><td className="px-3 tabular-nums">{compactNumber(item.avgViews)}</td><td className="px-3 tabular-nums">{percent(item.er)}</td><td className="px-3"><div className="flex items-center gap-2"><div className="h-1.5 w-14 rounded-full bg-canvas"><div className="h-full rounded-full bg-[#a1b58c]" style={{ width: `${item.niche}%` }}/></div><span className="tabular-nums text-muted">{item.niche}%</span></div></td></tr>)}</tbody></table></div>
      </Panel>
      <div className="space-y-5 self-start">
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Сохранить набор</h2><p className="mt-1 text-[10px] text-muted">Выбрано: {picked.length ? picked.join(" ") : "ничего"}</p>
          <form onSubmit={saveSet} className="mt-4 space-y-3"><label className="sr-only" htmlFor="set-name">Название набора</label><input id="set-name" className="input" placeholder="Название набора" value={setName} onChange={(event) => setSetName(event.target.value)} maxLength={40}/><button className="btn btn-primary w-full" type="submit"><Icon name="bookmark" size={16}/>Сохранить в проекте</button></form></Panel>
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Сохранённые наборы</h2>
          <ul className="mt-4 space-y-3">{sets.map((set, index) => <li key={`${set.name}-${index}`} className="rounded-xl bg-canvas p-3"><div className="flex items-center justify-between"><p className="text-xs font-semibold">{set.name}</p><button aria-label={`Удалить набор ${set.name}`} className="rounded p-1 text-muted hover:text-ink" onClick={() => setSets((previous) => previous.filter((_, i) => i !== index))}><Icon name="trash" size={14}/></button></div><p className="mt-1.5 text-[11px] text-[#7b856f]">{set.tags.join(" ")}</p></li>)}{!sets.length && <li className="text-xs text-muted">Наборов пока нет.</li>}</ul>
          <Link href="/ai-studio" className="mt-4 flex items-center justify-between text-xs font-semibold text-[#8a704e]">Использовать в AI-студии<Icon name="arrow-up-right" size={15}/></Link></Panel>
      </div>
    </div>
    <p className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-[#969d8e]"><Icon name="info" size={13} className="mt-0.5 shrink-0"/>Рекомендации основаны на демонстрационной выборке, а не на знании внутренних механизмов продвижения платформ. Наборы и выбранные хештеги сохраняются в этом браузере для вашего аккаунта.</p>
  </>;
}
