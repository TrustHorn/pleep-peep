"use client";

import { useWorkspace } from "@/components/app-shell";
import { SupportInbox } from "@/components/support-inbox";
import { Icon, PageHeading, Panel } from "@/components/ui";
import { useBrowserState } from "@/lib/browser-storage";

const services = [
  { name: "Веб-интерфейс", state: "ok", note: "Статическая сборка" },
  { name: "API и база данных", state: "off", note: "Не подключены (прототип)" },
  { name: "Очередь фоновых задач", state: "off", note: "Не подключена" },
  { name: "AI-обработка", state: "off", note: "Демо-шаблоны вместо LLM" },
];
const auditLog = [
  { at: "30 окт, 14:12", actor: "Айдана С.", action: "Экспортировала AI Summary" },
  { at: "30 окт, 11:03", actor: "Тимур А.", action: "Добавил конкурента @drip.stories" },
  { at: "29 окт, 17:45", actor: "Мадина К.", action: "Запустила анализ хештегов" },
  { at: "27 окт, 09:20", actor: "Айдана С.", action: "Пригласила участника (Арман Ж.)" },
];

export default function AdminPage() {
  const { toast } = useWorkspace();
  const [maintenance, setMaintenance] = useBrowserState("admin-maintenance", false);
  const [users, setUsers] = useBrowserState("admin-users", [{ id: "u1", name: "Айдана Серикова", role: "Владелец", blocked: false }, { id: "u2", name: "Тимур Ахметов", role: "SMM-специалист", blocked: false }, { id: "u3", name: "Мадина Касымова", role: "Аналитик", blocked: false }]);

  return <>
    <PageHeading eyebrow="СЛУЖЕБНЫЙ РАЗДЕЛ" title="Администрирование" description="Обращения в поддержку, состояние сервиса, доступ пользователей и журнал действий."/>
    <div role="note" className="mb-5 flex items-start gap-3 rounded-2xl border border-[#f1ddce] bg-[#fcf0e6] p-4 text-xs leading-6 text-[#897460]"><Icon name="shield" size={17} className="mt-1 shrink-0"/>Учебный раздел доступен всем. Обращения, ответы и настройки сохраняются в этом браузере. Управление доступом пользователей демонстрационное.</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{services.map((service) => <Panel key={service.name} className="p-5"><div className="flex items-center gap-2 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${service.state === "ok" ? "bg-positive" : "bg-[#c9cfc1]"}`}/>{service.name}</div><p className="mt-3 text-[11px] text-muted">{service.note}</p></Panel>)}</div>
    <SupportInbox/>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Пользователи</h2>
        <ul className="mt-4 divide-y divide-border">{users.map((user) => <li key={user.id} className="flex items-center justify-between gap-3 py-3.5 text-xs"><span><span className="block font-semibold">{user.name}</span><span className="text-[10px] text-muted">{user.role}</span></span>{user.role === "Владелец" ? <span className="badge">Владелец</span> : <button className="btn btn-secondary !min-h-8 !px-3 !py-1.5 !text-[11px]" onClick={() => { setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, blocked: !item.blocked } : item)); toast(user.blocked ? `${user.name}: доступ возвращён` : `${user.name}: доступ закрыт`); }}>{user.blocked ? "Вернуть доступ" : "Закрыть доступ"}</button>}</li>)}</ul></Panel>
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Журнал действий</h2>
        <ul className="mt-4 divide-y divide-border">{auditLog.map((entry) => <li key={entry.at + entry.action} className="py-3.5 text-xs"><p className="text-[10px] text-muted">{entry.at} · {entry.actor}</p><p className="mt-1">{entry.action}</p></li>)}</ul></Panel>
      <Panel className="p-6 xl:col-span-2"><div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold tracking-tight">Режим обслуживания</h2><p className="mt-1 text-[11px] text-muted">Показывает пользователям уведомление о технических работах.</p></div><button role="switch" aria-checked={maintenance} aria-label="Режим обслуживания" onClick={() => { setMaintenance(!maintenance); toast(!maintenance ? "Режим обслуживания включён (демо)" : "Режим обслуживания выключен"); }} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${maintenance ? "bg-accent" : "bg-[#d1d7ca]"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${maintenance ? "left-[22px]" : "left-0.5"}`}/></button></div></Panel>
    </div>
  </>;
}
