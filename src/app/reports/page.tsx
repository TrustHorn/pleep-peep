"use client";

import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/components/app-shell";
import { useCompetitorAccounts } from "@/components/competitor-context";
import { Icon, PageHeading, Panel } from "@/components/ui";
import { compactNumber, demoComments, demoHashtags, demoVideos, downloadText, percent } from "@/lib/demo-data";

export default function ReportsPage() {
  const { toast, period } = useWorkspace();
  const [accounts] = useCompetitorAccounts();
  const [generated, setGenerated] = useState(true);
  const platforms = [...new Set(accounts.map((account) => account.platform))];
  const bestVideos = [...demoVideos].sort((a, b) => b.views - a.views).slice(0, 3);
  const withData = accounts.filter((account) => account.views !== null);

  const sections: { title: string; body: string; source?: string }[] = [
    { title: "1. Цель и параметры исследования", body: "Определить форматы коротких видео, которые собирают больше внимания в нише кофеен Алматы, и подготовить идеи для собственного контента." },
    { title: "2. Платформы и период", body: `${platforms.join(", ") || "—"} · последние ${period} дней · демонстрационная выборка август — октябрь 2026.` },
    { title: "3. Объём данных", body: `Аккаунтов: ${accounts.length} (с метриками: ${withData.length}). Публикаций: ${demoVideos.length}. Комментариев: ${demoComments.length}.` },
    { title: "4. Что объединяет успешные ролики", body: `Лидеры по просмотрам: ${bestVideos.map((video) => `«${video.title}» (${compactNumber(video.views)})`).join("; ")}. Общее: длительность 19–31 с, живой процесс приготовления, понятная история.`, source: "Публикации v1, v2, v7" },
    { title: "5. Закономерности", body: "Ролики о ритуалах и людях за стойкой набирают больше вовлечения, чем кадры готового напитка. Связь наблюдаемая, причинность не доказана." },
    { title: "6. Темы обсуждений аудитории", body: "Чаще всего зрители спрашивают о товаре и цене, просят продолжение и реже критикуют. Выборка комментариев мала, достоверность ограничена.", source: "Раздел «Комментарии»" },
    { title: "7. Хештеги", body: `Лучшие по среднему ER: ${[...demoHashtags].sort((a, b) => b.er - a.er).slice(0, 3).map((item) => `${item.tag} (${percent(item.er)})`).join(", ")}.`, source: "Раздел «Хештеги»" },
    { title: "8. Сравнение конкурентов", body: withData.length ? withData.map((account) => `${account.name}: ER ${account.interactions !== null && account.views ? percent(account.interactions / account.views * 100) : "—"}`).join("; ") + "." : "Нет аккаунтов с метриками.", source: "Раздел «Конкуренты»" },
    { title: "9. Рекомендации по новым роликам", body: "Снять 20–30-секундные ролики о процессе приготовления; добавить повторяемый приём (например, «три шага»); отвечать на частые вопросы о товаре и цене отдельными видео." },
    { title: "10. Предлагаемые темы и сценарии", body: "«Маленький ритуал большого города», «Мифы про эспрессо», «Как выбрать кофе дома». Сценарии доступны в AI-студии." },
    { title: "11. Выводы и дальнейшие действия", body: "Протестировать 3 ролика за 2 недели, сравнить ER по просмотрам с выборкой, затем обновить отчёт." },
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
      <div className="space-y-5 self-start"><section className="rounded-[22px] bg-[#fae6d9] p-6"><p className="section-kicker !text-[#a46644]">Главное</p><p className="mt-3 text-lg leading-snug font-semibold tracking-tight">Покажите процесс. Ритуал работает лучше, чем готовый напиток.</p><Link href="/ai-studio" className="mt-5 flex items-center justify-between border-t border-[#ebcbb5] pt-4 text-xs font-semibold text-[#8b5033]">Превратить в сценарий<Icon name="arrow-up-right" size={16}/></Link></section>
        <Panel className="p-6 text-xs leading-6 text-muted"><h2 className="mb-2 text-sm font-semibold text-ink">Как читать отчёт</h2>Каждый вывод ссылается на раздел платформы, где лежат исходные данные. Мнение аудитории отделено от фактов.</Panel></div>
    </div>}
  </>;
}
