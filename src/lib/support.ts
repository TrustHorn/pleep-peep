export const ticketStatuses = ["Открыто", "В работе", "Решено"] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export type SupportReply = {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  subject: string;
  topic: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies: SupportReply[];
};

export const initialSupportTickets: SupportTicket[] = [{
  id: "T-1001",
  authorId: "demo",
  authorName: "Команда SLOW",
  authorEmail: "",
  subject: "Как добавить второго конкурента?",
  topic: "Вопрос",
  message: "Не нашёл кнопку добавления.",
  status: "Решено",
  createdAt: "2026-10-28T09:00:00.000Z",
  updatedAt: "2026-10-28T10:00:00.000Z",
  replies: [{
    id: "demo-reply-1",
    authorName: "Поддержка",
    message: "Откройте раздел «Конкуренты» и нажмите «Добавить конкурента».",
    createdAt: "2026-10-28T10:00:00.000Z",
  }],
}];

export function supportDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
