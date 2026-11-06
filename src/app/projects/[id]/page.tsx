import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, PageHeading, Panel, PlatformBadge } from "@/components/ui";
import { demoProjects } from "@/lib/demo-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return demoProjects.map((project) => ({ id: project.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = demoProjects.find((item) => item.id === id);
  if (!project) notFound();
  return <>
    <Link href="/projects" className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent"><Icon name="arrow-right" size={13} className="rotate-180"/>Все проекты</Link>
    <PageHeading eyebrow={`ПРОЕКТ · ${project.status.toUpperCase()}`} title={project.name} description={project.goal}>
      <Link href="/reports" className="btn btn-secondary"><Icon name="file" size={16}/>AI Summary</Link>
      <Link href="/ai-studio" className="btn btn-primary"><Icon name="sparkles" size={16}/>В AI-студию</Link>
    </PageHeading>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Panel className="p-5"><p className="text-[11px] text-muted">Конкуренты</p><p className="mt-3 text-3xl font-semibold tracking-tight">{project.competitors}</p></Panel>
          <Panel className="p-5"><p className="text-[11px] text-muted">Видео в выборке</p><p className="mt-3 text-3xl font-semibold tracking-tight">{project.videos}</p></Panel>
          <Panel className="col-span-2 p-5 sm:col-span-1"><p className="text-[11px] text-muted">Платформы</p><div className="mt-3 flex flex-wrap gap-2">{project.platforms.map((platform) => <PlatformBadge key={platform} platform={platform}/>)}</div></Panel>
        </div>
        <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">Настройки исследования</h2>
          <dl className="mt-4 divide-y divide-border text-xs">{[["Период анализа", "30 дней"], ["База расчёта ER", "по просмотрам"], ["Язык комментариев", "русский, английский"], ["Последнее обновление", project.updated]].map(([term, value]) => <div key={term} className="flex justify-between gap-4 py-3"><dt className="text-muted">{term}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-3">{[{ href: "/competitors", label: "Конкуренты", icon: "users" }, { href: "/analytics", label: "Аналитика", icon: "chart" }, { href: "/hashtags", label: "Хештеги", icon: "hash" }].map((link) => <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-sm font-medium hover:border-[#b9c1b4]"><Icon name={link.icon} size={18} className="text-accent"/>{link.label}<Icon name="arrow-up-right" size={15} className="ml-auto text-muted"/></Link>)}</div>
      </div>
      <Panel className="p-6"><h2 className="text-base font-semibold tracking-tight">История</h2>
        <ol className="mt-5 space-y-5 border-l border-border pl-5">{project.history.map((item) => <li key={item.date + item.text} className="relative"><span className="absolute top-1.5 -left-[25px] h-2 w-2 rounded-full bg-accent"/><p className="text-[10px] text-muted">{item.date}</p><p className="mt-1 text-xs leading-5">{item.text}</p></li>)}</ol>
      </Panel>
    </div>
    <p className="mt-6 text-[10px] text-[#969d8e]">Демонстрационные данные. Показатели вымышлены.</p>
  </>;
}
