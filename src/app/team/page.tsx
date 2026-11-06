"use client";

import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useAuth, useUserState } from "@/components/auth-context";
import { Icon, Modal, PageHeading, Panel } from "@/components/ui";
import { demoMembers, permissionMatrix, roles, type Member, type Role } from "@/lib/demo-data";

const accessLabel = (value: boolean | "own") => value === true ? "Да" : value === "own" ? "Свой" : "Нет";
const accessStyle = (value: boolean | "own") => value === true ? "bg-[#edf4e9] text-positive" : value === "own" ? "bg-[#f4edda] text-[#8f793e]" : "bg-soft text-muted";

export default function TeamPage() {
  const { toast } = useWorkspace();
  const { user, updateProfile } = useAuth();
  const [members, setMembers] = useUserState<Member[]>("team", demoMembers.map((member) => member.role === "Владелец" && user ? { ...member, name: user.name, email: user.email } : member));
  const [editing, setEditing] = useState<Member | null>(null);
  const [editError, setEditError] = useState("");
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

  function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const name = editing.name.trim();
    const email = editing.email.trim().toLowerCase();
    if (name.length < 2) { setEditError("Имя — не менее 2 символов."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setEditError("Введите корректный адрес почты."); return; }
    if (members.some((member) => member.id !== editing.id && member.email.trim().toLowerCase() === email)) { setEditError("Эта почта уже есть в команде."); return; }
    if (editing.role === "Владелец" && user) {
      try { updateProfile({ name, email, language: user.language }); }
      catch (cause) { setEditError(cause instanceof Error ? cause.message : "Не удалось сохранить профиль."); return; }
    }
    setMembers((previous) => previous.map((member) => member.id === editing.id ? { ...member, name, email } : member));
    setEditing(null); setEditError(""); toast("Данные участника сохранены");
  }

  return <>
    <PageHeading eyebrow="СОВМЕСТНАЯ РАБОТА" title="Команда" description="Участники рабочего пространства и права доступа по ролям.">
      <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={17}/>Пригласить</button>
    </PageHeading>
    <Panel className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr>{["Участник", "Роль", "Проект", "Статус", ""].map((heading, i) => <th key={i} scope="col" className="px-5 py-3.5 font-medium">{heading || <span className="sr-only">Действия</span>}</th>)}</tr></thead>
      <tbody>{members.map((member) => <tr key={member.id} className="border-t border-border/80"><th scope="row" className="px-5 py-4 font-normal"><span className="block font-semibold">{member.name}</span><span className="text-[10px] text-muted">{member.email}</span></th><td className="px-5"><label className="sr-only" htmlFor={`role-${member.id}`}>Роль {member.name}</label><select id={`role-${member.id}`} className="input !w-auto !py-2 !text-xs" value={member.role} disabled={member.role === "Владелец"} onChange={(event) => { const next = event.target.value as Role; setMembers((previous) => previous.map((item) => item.id === member.id ? { ...item, role: next } : item)); toast(`Роль ${member.name}: ${next}`); }}>{roles.filter((item) => item !== "Владелец" || member.role === "Владелец").map((item) => <option key={item}>{item}</option>)}</select></td><td className="px-5 text-muted">{member.project}</td><td className="px-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${member.status === "Активен" ? "bg-[#edf4e9] text-positive" : "bg-[#f4edda] text-[#8f793e]"}`}>{member.status}</span></td><td className="px-5 text-right"><button className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[11px]" aria-label={`Редактировать ${member.name}`} onClick={() => { setEditing({ ...member }); setEditError(""); }}><Icon name="edit" size={14}/></button>{member.role !== "Владелец" && <button className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[11px]" aria-label={`Удалить ${member.name}`} onClick={() => { setMembers((previous) => previous.filter((item) => item.id !== member.id)); toast(`${member.name} убран из команды`); }}><Icon name="trash" size={14}/></button>}</td></tr>)}</tbody></table></div></Panel>
    <Panel className="mt-6 overflow-hidden"><div className="border-b border-border px-5 py-4"><h2 className="text-base font-semibold tracking-tight">Матрица прав доступа</h2><p className="mt-1 text-[10px] text-muted">«Свой» — в пределах назначенного проекта.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-canvas/60 text-[11px] text-muted"><tr><th scope="col" className="px-5 py-3.5 font-medium">Функция</th>{roles.map((item) => <th key={item} scope="col" className="px-3 py-3.5 text-center font-medium">{item}</th>)}</tr></thead>
        <tbody>{permissionMatrix.map((row) => <tr key={row.feature} className="border-t border-border/80"><th scope="row" className="px-5 py-3.5 font-normal">{row.feature}</th>{row.access.map((value, index) => <td key={index} className="px-3 text-center"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${accessStyle(value)}`}>{accessLabel(value)}</span></td>)}</tr>)}</tbody></table></div></Panel>
    <p className="mt-5 text-[10px] leading-5 text-[#969d8e]">Прототип без сервера: права не применяются, а имена участников вымышлены. Изменения имён, почты и ролей сохраняются в этом браузере.</p>
    <Modal open={editing !== null} onClose={() => setEditing(null)} title="Редактировать участника" description="Измените имя и почту участника команды.">
      {editing && <form onSubmit={saveMember} className="space-y-5" noValidate>
        <div><label className="field-label" htmlFor="member-name">Имя</label><input id="member-name" className="input" maxLength={100} value={editing.name} onChange={(event) => { setEditing({ ...editing, name: event.target.value }); setEditError(""); }}/></div>
        <div><label className="field-label" htmlFor="member-email">Почта</label><input id="member-email" type="email" className="input" value={editing.email} onChange={(event) => { setEditing({ ...editing, email: event.target.value }); setEditError(""); }}/></div>
        {editError && <p role="alert" className="text-xs text-[#ad503b]">{editError}</p>}
        <div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Отмена</button><button type="submit" className="btn btn-primary">Сохранить изменения</button></div>
      </form>}
    </Modal>
    <Modal open={open} onClose={() => setOpen(false)} title="Пригласить участника" description="Приглашение создаётся локально, письмо не отправляется.">
      <form onSubmit={invite} className="space-y-5" noValidate><div><label htmlFor="invite-email" className="field-label">Почта</label><input id="invite-email" type="email" className="input" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="colleague@company.com"/></div><div><label htmlFor="invite-role" className="field-label">Роль</label><select id="invite-role" className="input" value={role} onChange={(event) => setRole(event.target.value as Role)}>{roles.filter((item) => item !== "Владелец").map((item) => <option key={item}>{item}</option>)}</select></div>{error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs text-[#ad503b]">{error}</p>}<div className="flex justify-end gap-2 border-t border-border pt-5"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Отмена</button><button type="submit" className="btn btn-primary">Пригласить</button></div></form>
    </Modal>
  </>;
}
