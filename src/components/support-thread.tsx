import { supportDate, type SupportTicket, type TicketStatus } from "@/lib/support";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "Решено" ? "bg-[#edf4e9] text-positive" : status === "В работе" ? "bg-[#f4edda] text-[#8f793e]" : "bg-soft text-muted"}`}>{status}</span>;
}

export function SupportThread({ ticket }: { ticket: SupportTicket }) {
  return <div className="space-y-3 text-xs">
    <div className="rounded-xl bg-canvas p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{ticket.authorName}</span><time dateTime={ticket.createdAt} className="text-[10px] text-muted">{supportDate(ticket.createdAt)}</time></div>
      <p className="mt-2 whitespace-pre-wrap break-words leading-6">{ticket.message}</p>
    </div>
    {ticket.replies.map((reply) => <div key={reply.id} className="rounded-xl border border-[#dde5d5] bg-[#f3f6ef] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">Поддержка · {reply.authorName}</span><time dateTime={reply.createdAt} className="text-[10px] text-muted">{supportDate(reply.createdAt)}</time></div>
      <p className="mt-2 whitespace-pre-wrap break-words leading-6">{reply.message}</p>
    </div>)}
    {!ticket.replies.length && <p className="text-[11px] text-muted">Ответов пока нет.</p>}
  </div>;
}
