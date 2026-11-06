"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useAuth } from "@/components/auth-context";
import { SupportThread, TicketStatusBadge } from "@/components/support-thread";
import { EmptyState, Icon, Modal, Panel } from "@/components/ui";
import { useBrowserState } from "@/lib/browser-storage";
import { initialSupportTickets, supportDate, ticketStatuses, type SupportTicket, type TicketStatus } from "@/lib/support";

export function SupportInbox() {
  const { toast } = useWorkspace();
  const { user, ready } = useAuth();
  const [tickets, setTickets] = useBrowserState<SupportTicket[]>("support-tickets", initialSupportTickets);
  const [drafts, setDrafts] = useBrowserState<Record<string, string>>("support-reply-drafts", {});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketStatus | "Все">("Все");
  const [error, setError] = useState("");
  const selected = tickets.find((ticket) => ticket.id === selectedId);
  const visible = tickets.filter((ticket) => filter === "Все" || ticket.status === filter);
  const openCount = tickets.filter((ticket) => ticket.status !== "Решено").length;

  function updateStatus(status: TicketStatus) {
    if (!selected) return;
    setTickets((previous) => previous.map((ticket) => ticket.id === selected.id ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket));
    toast(`Статус обращения: ${status.toLowerCase()}`);
  }

  function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !ready) return;
    const message = (drafts[selected.id] ?? "").trim();
    if (!message) { setError("Введите ответ пользователю."); return; }
    const now = new Date().toISOString();
    const response = { id: crypto.randomUUID(), authorName: user?.name ?? "Администратор", message, createdAt: now };
    setTickets((previous) => previous.map((ticket) => ticket.id === selected.id ? {
      ...ticket,
      status: ticket.status === "Открыто" ? "В работе" : ticket.status,
      updatedAt: now,
      replies: [...ticket.replies, response],
    } : ticket));
    setDrafts((previous) => { const next = { ...previous }; delete next[selected.id]; return next; });
    setError("");
    toast("Ответ сохранён и доступен пользователю в разделе «Поддержка»");
  }

  return <>
    <Panel className="mt-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-base font-semibold tracking-tight">Обращения в поддержку</h2><p className="mt-1 text-[11px] text-muted">{tickets.length} всего · {openCount} требуют решения</p></div>
        <label className="flex items-center gap-2 text-xs"><span className="text-muted">Статус</span><select className="input !w-auto" value={filter} onChange={(event) => setFilter(event.target.value as TicketStatus | "Все")}><option>Все</option>{ticketStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
      </div>
      {visible.length ? <ul className="mt-4 divide-y divide-border">{visible.map((ticket) => <li key={ticket.id}>
        <button type="button" className="flex w-full items-center gap-4 rounded-lg py-4 text-left hover:bg-canvas" onClick={() => { setSelectedId(ticket.id); setError(""); }}>
          <span className="min-w-0 flex-1"><span className="block break-words text-xs font-semibold">{ticket.subject}</span><span className="mt-1 block break-words text-[10px] text-muted">{ticket.authorName}{ticket.authorEmail ? ` · ${ticket.authorEmail}` : ""} · {ticket.topic} · {supportDate(ticket.createdAt)}</span><span className="mt-1.5 block text-[10px] text-muted">Ответов: {ticket.replies.length} · Открыть обращение</span></span>
          <TicketStatusBadge status={ticket.status}/><Icon name="chevron-right" size={16} className="shrink-0 text-muted"/>
        </button>
      </li>)}</ul> : <EmptyState title="Обращений нет" description={filter === "Все" ? "Здесь появятся сообщения из раздела «Поддержка»." : "Обращений с выбранным статусом пока нет."}/>}
    </Panel>
    <Modal open={Boolean(selected)} onClose={() => { setSelectedId(null); setError(""); }} title={selected?.subject ?? "Обращение"} description={selected ? `${selected.topic} · ${selected.authorName}${selected.authorEmail ? ` · ${selected.authorEmail}` : ""}` : undefined}>
      {selected && <>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] text-muted">{selected.id.slice(0, 10)}</span><label className="flex items-center gap-2 text-xs"><span>Статус обращения</span><select className="input !w-auto" value={selected.status} onChange={(event) => updateStatus(event.target.value as TicketStatus)}>{ticketStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
        <SupportThread ticket={selected}/>
        <form onSubmit={reply} className="mt-5 space-y-3" noValidate>
          <div><label className="field-label" htmlFor="support-reply">Ответ пользователю</label><textarea id="support-reply" rows={4} className="input" value={drafts[selected.id] ?? ""} onChange={(event) => { setDrafts((previous) => ({ ...previous, [selected.id]: event.target.value })); setError(""); }} placeholder="Напишите ответ…"/></div>
          {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}
          <button type="submit" disabled={!ready} className="btn btn-primary w-full disabled:opacity-50">Отправить ответ</button>
        </form>
      </>}
    </Modal>
  </>;
}
