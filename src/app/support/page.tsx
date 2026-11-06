"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useAuth } from "@/components/auth-context";
import { SupportThread, TicketStatusBadge } from "@/components/support-thread";
import { EmptyState, Icon, PageHeading, Panel } from "@/components/ui";
import { useBrowserState } from "@/lib/browser-storage";
import { initialSupportTickets, supportDate, type SupportTicket } from "@/lib/support";

const faq = [
  { q: "Откуда берутся данные?", a: "В прототипе — из демонстрационной выборки. Подключения к TikTok и Instagram нет." },
  { q: "Как считается ER?", a: "(лайки + комментарии + репосты + сохранения) / база × 100%. База — просмотры или подписчики, её можно выбрать в «Аналитике»." },
  { q: "Гарантирует ли платформа просмотры?", a: "Нет. Алгоритмы соцсетей закрыты, мы анализируем только наблюдаемые закономерности." },
  { q: "Где сохраняются мои данные?", a: "Аккаунт, проекты, изменения и обращения с ответами сохраняются в этом браузере. После перезагрузки они останутся; в другом браузере или после очистки данных сайта они недоступны." },
];

export default function SupportPage() {
  const { toast } = useWorkspace();
  const { user, ready } = useAuth();
  const authorId = user?.id ?? "demo";
  const [tickets, setTickets] = useBrowserState<SupportTicket[]>("support-tickets", initialSupportTickets);
  const [form, setForm] = useBrowserState(`support-draft:${authorId}`, { subject: "", topic: "Вопрос", message: "" });
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const myTickets = tickets.filter((ticket) => ticket.authorId === authorId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    if (form.subject.trim().length < 3) { setError("Укажите тему обращения."); return; }
    if (form.message.trim().length < 10) { setError("Опишите вопрос подробнее: не менее 10 символов."); return; }
    const now = new Date().toISOString();
    setTickets((previous) => [{ id: `T-${crypto.randomUUID()}`, authorId, authorName: user?.name ?? "Команда SLOW", authorEmail: user?.email ?? "", subject: form.subject.trim(), topic: form.topic, message: form.message.trim(), status: "Открыто", createdAt: now, updatedAt: now, replies: [] }, ...previous]);
    setForm({ subject: "", topic: "Вопрос", message: "" }); setError("");
    toast("Обращение сохранено. Ответ появится здесь после ответа в администрировании");
  }

  return <>
    <PageHeading eyebrow="МЫ РЯДОМ" title="Поддержка" description="Напишите нам или найдите ответ среди частых вопросов."/>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Panel className="self-start p-6"><h2 className="text-base font-semibold tracking-tight">Новое обращение</h2>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <div><label htmlFor="ticket-subject" className="field-label">Тема</label><input id="ticket-subject" className="input" maxLength={100} value={form.subject} onChange={(event) => { setForm({ ...form, subject: event.target.value }); setError(""); }}/></div>
          <div><label htmlFor="ticket-topic" className="field-label">Тип</label><select id="ticket-topic" className="input" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>{["Вопрос", "Ошибка", "Предложение", "Доступ и права"].map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label htmlFor="ticket-message" className="field-label">Сообщение</label><textarea id="ticket-message" rows={5} className="input" value={form.message} onChange={(event) => { setForm({ ...form, message: event.target.value }); setError(""); }}/></div>
          {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}
          <button type="submit" disabled={!ready} className="btn btn-primary w-full disabled:opacity-50">Отправить</button>
          <p className="text-[10px] leading-5 text-muted">Обращение и ответы доступны в этом браузере в разделах «Поддержка» и «Администрирование».</p>
        </form></Panel>
      <div className="space-y-5">
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Мои обращения</h2>
          {!ready ? <p className="mt-4 text-xs text-muted">Загружаем обращения…</p> : myTickets.length ? <ul className="mt-4 divide-y divide-border">{myTickets.map((ticket) => <li key={ticket.id} className="py-4 text-xs"><div className="flex items-start justify-between gap-3"><span className="min-w-0 break-words font-semibold">{ticket.subject}</span><TicketStatusBadge status={ticket.status}/></div><p className="mt-1 mb-3 text-[10px] text-muted">{ticket.id.slice(0, 10)} · {ticket.topic} · {supportDate(ticket.createdAt)}</p><SupportThread ticket={ticket}/></li>)}</ul> : <EmptyState title="Обращений нет" description="Создайте первое обращение."/>}</Panel>
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Частые вопросы</h2>
          <ul className="mt-3 divide-y divide-border">{faq.map((item, index) => <li key={item.q}><button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-xs font-semibold">{item.q}<Icon name="chevron-down" size={15} className={openFaq === index ? "rotate-180" : ""}/></button>{openFaq === index && <p className="pb-3.5 text-xs leading-6 text-muted">{item.a}</p>}</li>)}</ul></Panel>
      </div>
    </div>
  </>;
}
