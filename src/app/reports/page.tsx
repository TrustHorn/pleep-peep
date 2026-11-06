"use client";

import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useCompetitorAccounts } from "@/components/competitor-context";
import { Icon, PageHeading, Panel } from "@/components/ui";
import { compactNumber, demoComments, downloadText, percent } from "@/lib/demo-data";
import { accountDateRangeStats, filterVideosByDateRange, formatDateRange, summarizeVideos } from "@/lib/date-range";

export default function ReportsPage() {
  const { toast, dateRange } = useWorkspace();
  const [storedAccounts] = useCompetitorAccounts();
  const accounts = storedAccounts.map((account) => accountDateRangeStats(account, dateRange));
  const [generated, setGenerated] = useState(true);
  const platforms = [...new Set(accounts.map((account) => account.platform))];
  const videos = filterVideosByDateRange(dateRange).filter((video) => accounts.some((account) => account.handle === video.account && account.platform === video.platform));
  const comments = demoComments.filter((comment) => videos.some((video) => video.id === comment.video));
  const bestVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 3);
  const withData = accounts.filter((account) => account.views !== null && account.views > 0);
  const tags = [...new Set(videos.flatMap((video) => video.tags))].map((tag) => ({ tag, er: summarizeVideos(videos.filter((video) => video.tags.includes(tag))).er })).sort((a, b) => b.er - a.er);
  const categories = [...new Set(comments.map((comment) => comment.category))];
  const noData = "В выбранном периоде нет публикаций. Выберите другой диапазон дат, чтобы сформировать выводы.";

  const sections: { title: string; body: string; source?: string }[] = [
    { title: "1. Цель и параметры исследования", body: "Определить форматы коротких видео, которые собирают больше внимания в нише кофеен Алматы, и подготовить идеи для собственного контента." },
    { title: "2. Платформы и период", body: `${platforms.join(", ") || "—"} · ${formatDateRange(dateRange)} · демонстрационная выборка.` },
    { title: "3. Объём данных", body: `Аккаунтов: ${accounts.length} (с публикациями в периоде: ${withData.length}). Публикаций: ${videos.length}. Комментариев с текстом: ${comments.length}.` },
    { title: "4. Что объединяет успешные ролики", body: bestVideos.length ? `Лидеры по просмотрам: ${bestVideos.map((video) => `«${video.title}» (${compactNumber(video.views)})`).join("; ")}. Длительность: ${Math.min(...bestVideos.map((video) => video.duration))}–${Math.max(...bestVideos.map((video) => video.duration))} с.` : noData, source: bestVideos.length ? `Публикации ${bestVideos.map((video) => video.id).join(", ")}` : undefined },
    { title: "5. Темы публикаций", body: videos.length ? `В периоде представлены темы: ${[...new Set(videos.map((video) => video.topic))].join(", ")}. Маленькая выборка не позволяет доказать причинность.` : noData },
    { title: "6. Темы обсуждений аудитории", body: comments.length ? `В комментариях встречаются: ${categories.join(", ").toLowerCase()}. Выборка мала, достоверность ограничена.` : "Комментарии к публикациям этого периода отсутствуют.", source: "Раздел «Комментарии»" },
    { title: "7. Хештеги", body: tags.length ? `Лучшие по ER публикаций: ${tags.slice(0, 3).map((item) => `${item.tag} (${percent(item.er)})`).join(", ")}.` : "В периоде нет хештегов.", source: "Публикации выбранного периода" },
    { title: "8. Сравнение конкурентов", body: withData.length ? withData.map((account) => `${account.name}: ER ${account.interactions !== null && account.views ? percent(account.interactions / account.views * 100) : "—"}`).join("; ") + "." : "Нет аккаунтов с метриками.", source: "Раздел «Конкуренты»" },
    { title: "9. Рекомендации по новым роликам", body: videos.length ? "Гипотеза для проверки: показать процесс приготовления и ответить на вопросы аудитории. Сравните результат с публикациями выбранного периода." : noData },
    { title: "10. Предлагаемые темы и сценарии", body: bestVideos.length ? `Используйте темы лидеров как отправную точку: ${[...new Set(bestVideos.map((video) => video.topic))].join(", ")}. Сценарии доступны в AI-студии.` : noData },
    { title: "11. Выводы и дальнейшие действия", body: videos.length ? "Протестировать новые ролики, сравнить ER по просмотрам с выборкой выбранного периода, затем обновить отчёт." : noData },
    { title: "12. Ограничения данных", body: "Алгоритмы TikTok и Instagram закрыты, анализ основан только на наблюдаемых метриках. Результаты вероятностные и не гарантируют просмотры. Данные демонстрационные." },
  ];

  function exportReport() {
    downloadText("pleep-peep-ai-summary.txt", `PLEEP·PEEP / AI SUMMARY\n\n${sections.map((section) => `${section.title}\n${section.body}${section.source ? `\nИсточник: ${section.source}` : ""}`).join("\n\n")}`);
    toast("Отчёт скачан в текстовом формате");
  }

  return <>
    <PageHeading eyebrow="ИТОГ ИССЛЕДОВАНИЯ" title="AI Summary" description="Итоговый отчёт: наблюдения, рекомендации и ограничения данных в одном месте.">
      <button className="btn btn-secondary" onClick={() => { setGenerated(false); setTimeout(() => { setGenerated(true); toast("Отчёт обновлён по текущим данным"); }, 700); }}><Icon name="sparkles" size={16}/>Обновить</button>
      <button className="btn btn-primary" onClick={exportReport}><Icon name="download" size={16}/>Экспорт</button>
    </PageHeading>
    {!generated ? <p role="status" className="py-24 text-center text-xs text-muted">Собираем отчёт…</p> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
      <div className="space-y-4">{sections.map((section) => <Panel key={section.title} className="p-6"><h2 className="text-[15px] font-semibold tracking-tight">{section.title}</h2><p className="mt-2.5 text-[13px] leading-7 text-muted">{section.body}</p>{section.source && <p className="mt-3 text-[10px] text-[#969d8e]">Источник: {section.source}</p>}</Panel>)}</div>
      <div className="space-y-5 self-start"><section className="rounded-[22px] bg-[#fae6d9] p-6"><p className="section-kicker !text-[#a46644]">Главное</p><p className="mt-3 text-lg leading-snug font-semibold tracking-tight">{bestVideos.length ? `Лидер периода: «${bestVideos[0].title}» — ${compactNumber(bestVideos[0].views)} просмотров.` : "В выбранном периоде нет публикаций."}</p><Link href="/ai-studio" className="mt-5 flex items-center justify-between border-t border-[#ebcbb5] pt-4 text-xs font-semibold text-[#8b5033]">Превратить в сценарий<Icon name="arrow-up-right" size={16}/></Link></section>
        <Panel className="p-6 text-xs leading-6 text-muted"><h2 className="mb-2 text-sm font-semibold text-ink">Как читать отчёт</h2>Каждый вывод ссылается на раздел платформы, где лежат исходные данные. Мнение аудитории отделено от фактов.</Panel></div>
    </div>}
  </>;
}
