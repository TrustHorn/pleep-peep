"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { EmptyState, Icon, PageHeading, Panel } from "@/components/ui";

type Ticket = { id: string; subject: string; topic: string; message: string; status: "Открыто" | "В работе" | "Решено"; date: string };

const faq = [
  { q: "Откуда берутся данные?", a: "В прототипе — из демонстрационной выборки. Подключения к TikTok и Instagram нет." },
  { q: "Как считается ER?", a: "(лайки + комментарии + репосты + сохранения) / база × 100%. База — просмотры или подписчики, её можно выбрать в «Аналитике»." },
  { q: "Гарантирует ли платформа просмотры?", a: "Нет. Алгоритмы соцсетей закрыты, мы анализируем только наблюдаемые закономерности." },
  { q: "Где сохраняются мои черновики?", a: "Черновики AI-студии — в localStorage вашего браузера. Остальное хранится до перезагрузки страницы." },
];

export default function SupportPage() {
  const { toast } = useWorkspace();
  const [tickets, setTickets] = useState<Ticket[]>([{ id: "T-1001", subject: "Как добавить второго конкурента?", topic: "Вопрос", message: "Не нашёл кнопку добавления.", status: "Решено", date: "28 окт" }]);
  const [form, setForm] = useState({ subject: "", topic: "Вопрос", message: "" });
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.subject.trim().length < 3) { setError("Укажите тему обращения."); return; }
    if (form.message.trim().length < 10) { setError("Опишите вопрос подробнее: не менее 10 символов."); return; }
    setTickets((previous) => [{ id: `T-${1002 + previous.length}`, subject: form.subject.trim(), topic: form.topic, message: form.message.trim(), status: "Открыто", date: "сегодня" }, ...previous]);
    setForm({ subject: "", topic: "Вопрос", message: "" }); setError("");
    toast("Обращение создано. Ответ в прототипе не придёт — сервера нет");
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
          <button type="submit" className="btn btn-primary w-full">Отправить</button>
        </form></Panel>
      <div className="space-y-5">
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Мои обращения</h2>
          {tickets.length ? <ul className="mt-4 divide-y divide-border">{tickets.map((ticket) => <li key={ticket.id} className="py-3.5 text-xs"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{ticket.subject}</span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${ticket.status === "Решено" ? "bg-[#edf4e9] text-positive" : ticket.status === "В работе" ? "bg-[#f4edda] text-[#8f793e]" : "bg-soft text-muted"}`}>{ticket.status}</span></div><p className="mt-1 text-[10px] text-muted">{ticket.id} · {ticket.topic} · {ticket.date}</p><p className="mt-2 leading-5 text-muted">{ticket.message}</p></li>)}</ul> : <EmptyState title="Обращений нет" description="Создайте первое обращение."/>}</Panel>
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Частые вопросы</h2>
          <ul className="mt-3 divide-y divide-border">{faq.map((item, index) => <li key={item.q}><button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-xs font-semibold">{item.q}<Icon name="chevron-down" size={15} className={openFaq === index ? "rotate-180" : ""}/></button>{openFaq === index && <p className="pb-3.5 text-xs leading-6 text-muted">{item.a}</p>}</li>)}</ul></Panel>
      </div>
    </div>
  </>;
}
