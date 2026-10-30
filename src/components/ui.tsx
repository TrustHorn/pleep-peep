"use client";

import { useEffect, useRef, type ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  chart: <><path d="M4 3v17h17M8 15l4-5 4 2 5-7"/><path d="M17 5h4v4"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87"/><circle cx="9.5" cy="7" r="4"/><path d="M16 3a4 4 0 0 1 0 8"/></>,
  sparkles: <><path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z"/><path d="M20 2v4m-2-2h4"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  "arrow-up-right": <path d="M6 18 18 6M6 6h12v12"/>,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6"/>,
  "arrow-up": <path d="M12 19V5m-6 6 6-6 6 6"/>,
  "chevron-down": <path d="m6 9 6 6 6-6"/>,
  "chevron-right": <path d="m9 6 6 6-6 6"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  filter: <path d="M4 7h16M7 12h10m-7 5h4"/>,
  list: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>,
  video: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
  coffee: <path d="M4 8h13v6a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8Zm13 0h1a3 3 0 0 1 0 6h-1M7 2v3m4-3v3m4-3v3"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.1"/></>,
  tiktok: <path d="M14 3v12a5 5 0 1 1-5-5m5-7c0 4 3 6 7 6"/>,
  edit: <path d="m15 4 5 5M4 20l1-6L17 2l5 5-12 12-6 1Z"/>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z"/>,
  play: <path d="m8 4 12 8-12 8V4Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>,
  message: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2-5a8.5 8.5 0 1 1 16-3.5Z"/>,
  folder: <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10H3V6Z"/>,
};

export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name] ?? paths.sparkles}</svg>;
}

export function Brand({ small = false }: { small?: boolean }) {
  return <span className="inline-flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-accent text-white"><svg width="26" height="23" viewBox="0 0 30 26" fill="none" aria-hidden="true"><path d="M5 19V8a4 4 0 0 1 8 0v3M17 19V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round"/><circle cx="10" cy="20" r="2.2" fill="currentColor"/><circle cx="22" cy="20" r="2.2" fill="currentColor"/></svg></span>{!small && <span className="text-[23px] font-bold tracking-[-1.2px]">pleep<span className="mx-[1px] text-accent">·</span>peep</span>}</span>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[22px] border border-border bg-surface ${className}`}>{children}</section>;
}

export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="section-kicker mb-2.5">{eyebrow}</p>}<h1 className="text-[29px] leading-[1.2] font-semibold tracking-[-1.2px] sm:text-[33px]">{title}</h1><p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-muted">{description}</p></div>{children && <div className="flex shrink-0 items-center gap-2">{children}</div>}</div>;
}

export function PlatformBadge({ platform, compact = false }: { platform: "TikTok" | "Instagram"; compact?: boolean }) {
  return <span className={`relative inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${platform === "TikTok" ? "bg-[#f0f2ed] text-ink" : "bg-[#f8edf0] text-[#a75a72]"}`}><Icon name={platform === "TikTok" ? "tiktok" : "instagram"} size={12}/><span className={compact ? "sr-only" : ""}>{platform}</span></span>;
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="flex flex-col items-center px-5 py-14 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-muted"><Icon name="search" size={25}/></span><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 mb-5 max-w-xs text-xs leading-6 text-muted">{description}</p>{children}</div>;
}

export function Modal({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="modal scrollbar-soft" aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}><div className="p-6 sm:p-8"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-[23px] font-semibold tracking-tight">{title}</h2>{description && <p className="mt-2 text-xs leading-6 text-muted">{description}</p>}</div><button className="btn btn-ghost -mt-1 -mr-2 p-2.5" onClick={onClose} aria-label="Закрыть окно"><Icon name="close"/></button></div>{children}</div></dialog>;
}
