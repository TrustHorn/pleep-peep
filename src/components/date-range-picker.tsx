"use client";

import { useState, type FormEvent } from "react";
import { DEMO_FIRST_DATE, DEMO_LAST_DATE, formatDate, formatDateRange, isValidDateRange, presetDateRange, type DateRange } from "@/lib/date-range";
import { Icon, Modal } from "./ui";

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const presets = [
    ...[7, 30, 90].map((days) => ({ label: `${days} дней`, range: presetDateRange(days) })),
    { label: "Вся выборка", range: { from: DEMO_FIRST_DATE, to: DEMO_LAST_DATE } },
  ];

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submittedRange = { from: String(form.get("from") ?? ""), to: String(form.get("to") ?? "") };
    setDraft(submittedRange);
    if (!isValidDateRange(submittedRange)) { setError("Укажите обе даты. Начало периода не должно быть позже окончания."); return; }
    onChange(submittedRange);
    setOpen(false);
  }

  function updateDate(field: keyof DateRange, date: string) {
    setDraft((previous) => ({ ...previous, [field]: date }));
    setError("");
  }

  return <>
    <button type="button" onClick={() => { setDraft(value); setError(""); setOpen(true); }} aria-haspopup="dialog" aria-label={`Период исследования: ${formatDateRange(value)}`} className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2 text-[10px] sm:text-[11px]">
      <Icon name="calendar" size={15} className="shrink-0 text-muted"/><span>{formatDateRange(value)}</span><Icon name="chevron-down" size={12}/>
    </button>
    <Modal open={open} onClose={() => setOpen(false)} title="Выберите период" description="Статистика будет рассчитана по публикациям за выбранные даты, включая первый и последний день.">
      <form onSubmit={apply} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-2" aria-label="Быстрый выбор периода">{presets.map(({ label, range }) => <button type="button" key={label} aria-pressed={draft.from === range.from && draft.to === range.to} onClick={() => { setDraft(range); setError(""); }} className={`rounded-xl border px-4 py-3 text-xs font-medium ${draft.from === range.from && draft.to === range.to ? "border-accent bg-[#fff6f1] text-accent" : "border-border bg-canvas hover:bg-soft"}`}>{label}</button>)}</div>
        <p className="text-[11px] leading-5 text-muted">Быстрые периоды заканчиваются датой последней демо-публикации — {formatDate(DEMO_LAST_DATE)}. Можно выбрать любые свои даты.</p>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="range-from">Дата начала</label><input id="range-from" name="from" type="date" className="input mt-2" value={draft.from} onInput={(event) => updateDate("from", event.currentTarget.value)} onChange={(event) => updateDate("from", event.currentTarget.value)} required aria-invalid={!!error} aria-describedby={error ? "date-range-error" : undefined}/></div><div><label className="field-label" htmlFor="range-to">Дата окончания</label><input id="range-to" name="to" type="date" className="input mt-2" value={draft.to} onInput={(event) => updateDate("to", event.currentTarget.value)} onChange={(event) => updateDate("to", event.currentTarget.value)} required aria-invalid={!!error} aria-describedby={error ? "date-range-error" : undefined}/></div></div>
        {error && <p id="date-range-error" role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Отмена</button><button type="submit" className="btn btn-primary"><Icon name="check" size={16}/>Применить</button></div>
      </form>
    </Modal>
  </>;
}
