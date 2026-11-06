"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { Icon, Modal, PageHeading, Panel } from "@/components/ui";
import { demoMembers, permissionMatrix, roles, type Member, type Role } from "@/lib/demo-data";

const accessLabel = (value: boolean | "own") => value === true ? "Да" : value === "own" ? "Свой" : "Нет";
const accessStyle = (value: boolean | "own") => value === true ? "bg-[#edf4e9] text-positive" : value === "own" ? "bg-[#f4edda] text-[#8f793e]" : "bg-soft text-muted";

export default function TeamPage() {
  const { toast } = useWorkspace();
  const [members, setMembers] = useState<Member[]>(demoMembers);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Наблюдатель");
  const [error, setError] = useState("");

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Введите корректный адрес почты."); return; }
    if (members.some((member) => member.email.toLowerCase() === email.trim().toLowerCase())) { setError("Этот участник уже в команде."); return; }
    setMembers((previous) => [...previous, { id: `local-${Date.now()}`, name: email.trim().split("@")[0], email: email.trim(), role, project: "SLOW Coffee", status: "Приглашён" }]);
    toast(`Приглашение для ${email.trim()} создано (письмо не отправляется)`);
    setOpen(false); setEmail(""); setRole("Наблюдатель"); setError("");
  }

  return <>
    <PageHeading eyebrow="СОВМЕСТНАЯ РАБОТА" title="Команда" description="Участники рабочего пространства и права доступа по ролям.">
      <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={17}/>Пригласить</button>
    </PageHeading>
    <Panel className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr>{["Участник", "Роль", "Проект", "Статус", ""].map((heading, i) => <th key={i} scope="col" className="px-5 py-3.5 font-medium">{heading || <span className="sr-only">Действия</span>}</th>)}</tr></thead>
      <tbody>{members.map((member) => <tr key={member.id} className="border-t border-border/80"><th scope="row" className="px-5 py-4 font-normal"><span className="block font-semibold">{member.name}</span><span className="text-[10px] text-muted">{member.email}</span></th><td className="px-5"><label className="sr-only" htmlFor={`role-${member.id}`}>Роль {member.name}</label><select id={`role-${member.id}`} className="input !w-auto !py-2 !text-xs" value={member.role} disabled={member.role === "Владелец"} onChange={(event) => { const next = event.target.value as Role; setMembers((previous) => previous.map((item) => item.id === member.id ? { ...item, role: next } : item)); toast(`Роль ${member.name}: ${next}`); }}>{roles.filter((item) => item !== "Владелец" || member.role === "Владелец").map((item) => <option key={item}>{item}</option>)}</select></td><td className="px-5 text-muted">{member.project}</td><td className="px-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${member.status === "Активен" ? "bg-[#edf4e9] text-positive" : "bg-[#f4edda] text-[#8f793e]"}`}>{member.status}</span></td><td className="px-5 text-right">{member.role !== "Владелец" && <button className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[11px]" aria-label={`Удалить ${member.name}`} onClick={() => { setMembers((previous) => previous.filter((item) => item.id !== member.id)); toast(`${member.name} убран из команды`); }}><Icon name="trash" size={14}/></button>}</td></tr>)}</tbody></table></div></Panel>
    <Panel className="mt-6 overflow-hidden"><div className="border-b border-border px-5 py-4"><h2 className="text-base font-semibold tracking-tight">Матрица прав доступа</h2><p className="mt-1 text-[10px] text-muted">«Свой» — в пределах назначенного проекта.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr><th scope="col" className="px-5 py-3.5 font-medium">Функция</th>{roles.map((item) => <th key={item} scope="col" className="px-3 py-3.5 text-center font-medium">{item}</th>)}</tr></thead>
        <tbody>{permissionMatrix.map((row) => <tr key={row.feature} className="border-t border-border/80"><th scope="row" className="px-5 py-3.5 font-normal">{row.feature}</th>{row.access.map((value, index) => <td key={index} className="px-3 text-center"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${accessStyle(value)}`}>{accessLabel(value)}</span></td>)}</tr>)}</tbody></table></div></Panel>
    <p className="mt-5 text-[10px] leading-5 text-[#969d8e]">Прототип без сервера: права не применяются, а имена участников вымышлены. Список хранится до перезагрузки страницы.</p>
    <Modal open={open} onClose={() => setOpen(false)} title="Пригласить участника" description="Приглашение создаётся локально, письмо не отправляется.">
      <form onSubmit={invite} className="space-y-5" noValidate><div><label htmlFor="invite-email" className="field-label">Почта</label><input id="invite-email" type="email" className="input" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="colleague@company.com"/></div><div><label htmlFor="invite-role" className="field-label">Роль</label><select id="invite-role" className="input" value={role} onChange={(event) => setRole(event.target.value as Role)}>{roles.filter((item) => item !== "Владелец").map((item) => <option key={item}>{item}</option>)}</select></div>{error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}<div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Отмена</button><button type="submit" className="btn btn-primary">Пригласить</button></div></form>
    </Modal>
  </>;
}
