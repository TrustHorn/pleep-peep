"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useWorkspace } from "@/components/app-shell";
import { EmptyState, Icon, Modal, PageHeading, Panel, PlatformBadge } from "@/components/ui";

type Brief = {
  topic: string;
  audience: string;
  platform: "Instagram" | "TikTok";
  duration: "15" | "30" | "60";
  tone: string;
  hashtags: string;
};

type Scene = { time: string; title: string; visual: string; voice: string };
type Idea = {
  title: string;
  format: string;
  angle: string;
  hook: string;
  scenes: Scene[];
  cta: string;
  description: string;
  hashtags: string;
};

type Draft = { id: string; savedAt: string; brief: Brief; ideas: Idea[]; selected: number };

const STORAGE_KEY = "pleep-peep:studio-drafts:v1";
const initialBrief: Brief = {
  topic: "Кофе, ради которого хочется замедлиться",
  audience: "Горожане 20–35 лет, которые ценят маленькие ритуалы",
  platform: "Instagram",
  duration: "30",
  tone: "Тёплый и живой",
  hashtags: "#slowcoffee #кофейня #утреннийритуал",
};

const presets = ["Утро с любимым кофе", "За стойкой бариста", "Кофейные мифы"];

function createIdeas(brief: Brief): Idea[] {
  const duration = Number(brief.duration);
  const first = Math.max(2, Math.round(duration * 0.12));
  const middle = Math.round(duration * 0.43);
  const last = Math.round(duration * 0.83);
  const times = [`0–${first} сек`, `${first}–${middle} сек`, `${middle}–${last} сек`, `${last}–${duration} сек`];
  const topic = brief.topic.trim();
  const hashtags = brief.hashtags.trim() || "#slowcoffee #кофе #маленькиеритуалы";
  const toneLine = brief.tone === "Экспертный и простой"
    ? "Объясняем спокойно, короткими предложениями и без сложных терминов."
    : brief.tone === "Лёгкий и ироничный"
      ? "Добавляем дружелюбную иронию и узнаваемую бытовую ситуацию."
      : "Говорим тепло и естественно, как с хорошим знакомым.";

  return [
    {
      title: topic,
      format: "Атмосферная история",
      angle: "Маленький ритуал вместо обычной рекламы. Детали, в которых зритель узнает себя.",
      hook: `А если лучшее в вашем утре — это всего одна пауза? ${topic}.`,
      scenes: [
        { time: times[0], title: "Остановить скролл", visual: "Крупный план: первые капли эспрессо и мягкий утренний свет. Титр повторяет главный вопрос.", voice: "Весь город спешит. А мы предлагаем сделать маленькую паузу." },
        { time: times[1], title: "Показать ощущение", visual: "Три коротких кадра: рука на тёплой чашке, текстура молока, место у окна. Съёмка на уровне глаз.", voice: `Сегодня наша история — «${topic}». Не идеальное утро, а один приятный момент внутри него.` },
        { time: times[2], title: "Добавить живую деталь", visual: "Бариста ставит чашку перед гостем. Короткая улыбка, естественные звуки кофейни и один непрерывный кадр.", voice: `Для тех, кто узнает себя в этом ритуале: ${brief.audience.toLowerCase()}. ${toneLine}` },
        { time: times[3], title: "Пригласить к диалогу", visual: "Чашка на столе, свободное место рядом. На экране появляется короткий вопрос без перегруженных титров.", voice: "А что помогает вам замедлиться? Расскажите про свой маленький ритуал." },
      ],
      cta: "Сохраните на утро и расскажите в комментариях о своём кофейном ритуале.",
      description: `${topic}. Иногда для хорошего дня достаточно тёплой чашки и нескольких минут для себя. А какой ваш любимый ритуал?`,
      hashtags,
    },
    {
      title: `Один секрет: ${topic.charAt(0).toLowerCase()}${topic.slice(1)}`,
      format: "Совет от бариста",
      angle: "Один понятный приём, который зритель захочет сохранить и попробовать самостоятельно.",
      hook: "Одна маленькая деталь меняет вкус вашей привычной чашки. Показываем на практике.",
      scenes: [
        { time: times[0], title: "Поставить вопрос", visual: "Две одинаковые чашки рядом. Бариста обращается прямо к камере. Титр: «В чём разница?».", voice: "На первый взгляд — одинаковый кофе. Но есть один нюанс." },
        { time: times[1], title: "Показать приём", visual: "Крупные планы приготовления. Оставить в кадре руки и один предмет, на который нужно обратить внимание.", voice: `Разбираем тему «${topic}» на одном простом примере. ${toneLine}` },
        { time: times[2], title: "Сравнить результат", visual: "Показать результат рядом с исходным вариантом. Короткий титр с одним выводом, без неподтверждённых цифр.", voice: "Попробуйте изменить только один шаг и сравните ощущения. Выберите тот вариант, который нравится именно вам." },
        { time: times[3], title: "Предложить продолжение", visual: "Бариста у стойки. Финальный титр: «Что разобрать следующим?».", voice: "Сохраните этот приём. И напишите, какой вопрос о кофе разобрать в следующий раз." },
      ],
      cta: "Сохраните совет и задайте свой вопрос бариста.",
      description: `Сегодня за стойкой SLOW Coffee разбираем: ${topic.toLowerCase()}. Один приём, немного внимания к деталям — и новый повод поэкспериментировать.`,
      hashtags,
    },
    {
      title: "Ваша пауза. Наши маленькие детали.",
      format: "Один день за кадром",
      angle: "Знакомство с людьми и процессом. Покажите, что стоит за готовой чашкой.",
      hook: "Вы видите чашку кофе. А мы — десяток маленьких деталей, из которых она складывается.",
      scenes: [
        { time: times[0], title: "Начать с результата", visual: "Готовый напиток на столе. Быстрый переход к пустой кофейне до открытия.", voice: `«${topic}» начинается ещё до того, как вы открыли дверь.` },
        { time: times[1], title: "Открыть закулисье", visual: "Бариста настраивает помол, протирает стойку и записывает короткую заметку. Естественный темп и дневной свет.", voice: "Подготовить стойку. Попробовать первую чашку. Найти тот самый вкус." },
        { time: times[2], title: "Показать людей", visual: "Небольшой разговор команды, руки в работе, первые гости. Использовать только свои кадры и согласованные съёмки.", voice: `Мы делаем это для людей, которым близка наша история. ${toneLine}` },
        { time: times[3], title: "Оставить приглашение", visual: "Открытая дверь кофейни и рукописная табличка SLOW Coffee. Кадр замирает на несколько секунд.", voice: "Всё готово. Осталось найти минуту для вашей паузы." },
      ],
      cta: "Поделитесь роликом с тем, с кем хочется выпить кофе.",
      description: `За каждой чашкой — люди и маленькие решения. Сегодня показываем историю «${topic}» изнутри. Загляните к нам за своей паузой.`,
      hashtags,
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIdea(value: unknown): value is Idea {
  if (!isRecord(value)) return false;
  const fields = ["title", "format", "angle", "hook", "cta", "description", "hashtags"];
  return fields.every((field) => typeof value[field] === "string") && Array.isArray(value.scenes)
    && value.scenes.every((scene: unknown) => isRecord(scene) && ["time", "title", "visual", "voice"].every((field) => typeof scene[field] === "string"));
}

function readDrafts(): Draft[] {
  const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(saved)) return [];
  return saved.filter((draft: unknown): draft is Draft => {
    if (!isRecord(draft) || !isRecord(draft.brief)) return false;
    const brief = draft.brief;
    return typeof draft.id === "string" && typeof draft.savedAt === "string"
      && typeof draft.selected === "number" && Number.isInteger(draft.selected) && Array.isArray(draft.ideas) && draft.ideas.length === 3
      && draft.ideas.every(isIdea) && draft.selected >= 0 && draft.selected < draft.ideas.length
      && ["topic", "audience", "tone", "hashtags"].every((key) => typeof brief[key] === "string")
      && (brief.platform === "Instagram" || brief.platform === "TikTok")
      && ["15", "30", "60"].includes(String(brief.duration));
  });
}

function scriptText(idea: Idea, brief: Brief) {
  return `${idea.title}\n${idea.format} · ${brief.platform} · ${brief.duration} секунд\nАудитория: ${brief.audience}\nТон: ${brief.tone}\n\nВСТУПЛЕНИЕ\n${idea.hook}\n\nСЦЕНАРИЙ\n${idea.scenes.map((scene, index) => `${index + 1}. ${scene.title} (${scene.time})\nВ кадре: ${scene.visual}\nОзвучивание: ${scene.voice}`).join("\n\n")}\n\nПРИЗЫВ К ДЕЙСТВИЮ\n${idea.cta}\n\nОПИСАНИЕ ПУБЛИКАЦИИ\n${idea.description}\n\n${idea.hashtags}\n\nПодготовлено в демо-студии pleep-peep. Сценарий можно адаптировать перед съёмкой.`;
}

export default function AiStudioPage() {
  const { toast } = useWorkspace();
  const [brief, setBrief] = useState<Brief>(initialBrief);
  const [resultBrief, setResultBrief] = useState<Brief>(initialBrief);
  const [ideas, setIdeas] = useState<Idea[]>(() => createIdeas(initialBrief));
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"ideas" | "script">("ideas");
  const [generating, setGenerating] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const generationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdea = ideas[selected];

  useEffect(() => () => {
    if (generationTimer.current) clearTimeout(generationTimer.current);
  }, []);

  function updateBrief<Key extends keyof Brief>(key: Key, value: Brief[Key]) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (brief.topic.trim().length < 3 || brief.audience.trim().length < 3) {
      toast("Укажите тему и аудиторию — хотя бы по 3 символа.");
      return;
    }
    setGenerating(true);
    const nextBrief = { ...brief, topic: brief.topic.trim(), audience: brief.audience.trim() };
    generationTimer.current = setTimeout(() => {
      setIdeas(createIdeas(nextBrief));
      setResultBrief(nextBrief);
      setSelected(0);
      setTab("ideas");
      setEditing(false);
      setSaved(false);
      setDraftId(null);
      setGenerating(false);
      toast("Три демо-идеи готовы. Выберите ту, которая вам ближе.");
    }, 650);
  }

  function updateIdea(field: Exclude<keyof Idea, "scenes">, value: string) {
    setIdeas((current) => current.map((idea, index) => index === selected ? { ...idea, [field]: value } : idea));
    setSaved(false);
  }

  function updateScene(index: number, field: "visual" | "voice", value: string) {
    setIdeas((current) => current.map((idea, ideaIndex) => ideaIndex === selected
      ? { ...idea, scenes: idea.scenes.map((scene, sceneIndex) => sceneIndex === index ? { ...scene, [field]: value } : scene) }
      : idea));
    setSaved(false);
  }

  function saveDraft() {
    try {
      const draft: Draft = { id: draftId || String(Date.now()), savedAt: new Date().toISOString(), brief: resultBrief, ideas, selected };
      const updated = [draft, ...readDrafts().filter((item) => item.id !== draft.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDrafts(updated);
      setDraftId(draft.id);
      setSaved(true);
      toast("Черновик сохранён в этом браузере.");
    } catch {
      toast("Сохранить не удалось: хранилище браузера недоступно. Скачайте сценарий.");
    }
  }

  function showDrafts() {
    try {
      setDrafts(readDrafts());
      setDraftsOpen(true);
    } catch {
      toast("Не удалось открыть черновики в этом браузере.");
    }
  }

  function loadDraft(draft: Draft) {
    if (generationTimer.current) {
      clearTimeout(generationTimer.current);
      generationTimer.current = null;
    }
    setGenerating(false);
    setBrief(draft.brief);
    setResultBrief(draft.brief);
    setIdeas(draft.ideas);
    setSelected(draft.selected);
    setDraftId(draft.id);
    setSaved(true);
    setTab("script");
    setEditing(false);
    setDraftsOpen(false);
    toast("Черновик открыт.");
  }

  function deleteDraft(id: string) {
    try {
      const updated = readDrafts().filter((draft) => draft.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDrafts(updated);
      if (draftId === id) {
        setDraftId(null);
        setSaved(false);
      }
      toast("Черновик удалён из этого браузера.");
    } catch {
      toast("Удалить черновик не удалось. Попробуйте ещё раз.");
    }
  }

  async function copyScript() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(scriptText(activeIdea, resultBrief));
      toast("Сценарий скопирован.");
    } catch {
      toast("Копирование недоступно. Используйте кнопку скачивания.");
    }
  }

  function downloadScript() {
    const blob = new Blob(["\uFEFF", scriptText(activeIdea, resultBrief)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "slow-coffee-scenario.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Сценарий подготовлен к скачиванию.");
  }

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="ОТ ДАННЫХ К ТВОРЧЕСТВУ"
        title="Хорошая идея — только начало."
        description="Превратите наблюдения в контент, который хочется посмотреть."
      >
        <button type="button" className="btn btn-secondary" onClick={showDrafts}>
          <Icon name="bookmark" size={17} /> Мои черновики
        </button>
      </PageHeading>

      <div className="grid items-start gap-6 xl:grid-cols-[350px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e9] text-accent"><Icon name="sparkles" size={20} /></div>
            <h2 className="text-lg font-semibold tracking-tight">О чём расскажем?</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Немного контекста для вашей следующей идеи.</p>
          </div>
          <form className="space-y-5 p-6" onSubmit={generate}>
            <div>
              <label className="field-label" htmlFor="studio-topic">Тема видео</label>
              <textarea id="studio-topic" className="input min-h-[94px] resize-y leading-relaxed" value={brief.topic} minLength={3} maxLength={160} required onChange={(event) => updateBrief("topic", event.target.value)} />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {presets.map((preset) => <button type="button" key={preset} onClick={() => updateBrief("topic", preset)} className="rounded-md bg-soft px-2 py-1 text-[10px] font-medium text-ink/70 transition-colors hover:bg-[#f9e4da] hover:text-ink">{preset}</button>)}
              </div>
            </div>
            <fieldset>
              <legend className="field-label">Площадка</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["Instagram", "TikTok"] as const).map((platform) => <button type="button" key={platform} onClick={() => updateBrief("platform", platform)} aria-pressed={brief.platform === platform} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${brief.platform === platform ? "border-ink bg-ink text-white" : "border-border bg-white hover:bg-soft"}`}><Icon name={platform.toLowerCase()} size={16} />{platform}</button>)}
              </div>
            </fieldset>
            <div>
              <label className="field-label" htmlFor="studio-audience">Для кого</label>
              <textarea id="studio-audience" className="input min-h-[76px] resize-y text-sm leading-relaxed" value={brief.audience} minLength={3} maxLength={200} required onChange={(event) => updateBrief("audience", event.target.value)} />
            </div>
            <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
              <div>
                <label className="field-label" htmlFor="studio-duration">Длительность</label>
                <select id="studio-duration" className="input" value={brief.duration} onChange={(event) => updateBrief("duration", event.target.value as Brief["duration"])}><option value="15">15 сек</option><option value="30">30 сек</option><option value="60">60 сек</option></select>
              </div>
              <div>
                <label className="field-label" htmlFor="studio-tone">Тон общения</label>
                <select id="studio-tone" className="input" value={brief.tone} onChange={(event) => updateBrief("tone", event.target.value)}><option>Тёплый и живой</option><option>Экспертный и простой</option><option>Лёгкий и ироничный</option></select>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="studio-hashtags">Хештеги <span className="font-normal text-muted">· необязательно</span></label>
              <input id="studio-hashtags" className="input text-sm" value={brief.hashtags} maxLength={200} onChange={(event) => updateBrief("hashtags", event.target.value)} />
            </div>
            <div className="border-t border-border pt-5">
              <button type="submit" disabled={generating} className="btn btn-primary w-full justify-center disabled:cursor-wait disabled:opacity-65"><Icon name="sparkles" size={17} />{generating ? "Подбираем примеры…" : "Создать демо-идеи"}<Icon name="arrow-right" size={17} /></button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">Демо-генерация · примеры адаптируются под ваш бриф</p>
            </div>
          </form>
        </Panel>

        <div className="min-w-0 space-y-5" aria-busy={generating}>
          <div className="relative overflow-hidden rounded-[22px] bg-[#e9eddf] px-6 py-6 sm:px-8">
            <div className="relative z-10 max-w-[80%]">
              <span className="text-[10px] font-semibold tracking-[.16em] text-[#69745d]">НЕМНОГО ВДОХНОВЕНИЯ</span>
              <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-.035em] sm:text-[27px]">Меньше пустого листа.<br />Больше ваших историй.</h2>
              <p className="mt-2 max-w-[360px] text-xs leading-relaxed text-[#69745d]">Хорошие ролики начинаются с простого наблюдения.<br className="hidden sm:block" /> Выберите направление и добавьте свой характер.</p>
            </div>
            <div aria-hidden="true" className="absolute -right-7 top-8 flex h-36 w-36 rotate-[-13deg] items-center justify-center rounded-[35px] border-[8px] border-white/65 bg-[#d6ddc8] sm:right-8"><Icon name="coffee" className="text-[#69765b]" size={67} /><div className="absolute -left-5 top-[-20px] flex h-12 w-12 rotate-12 items-center justify-center rounded-full bg-[#f7b68c] text-[#744b31]"><Icon name="sparkles" size={23} /></div></div>
          </div>

          <Panel className={`overflow-hidden transition-opacity ${generating ? "opacity-50" : "opacity-100"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 sm:px-6">
              <div role="tablist" aria-label="Результат работы студии" className="flex gap-5">
                {([{ id: "ideas", title: "Идеи", count: "03" }, { id: "script", title: "Сценарий", count: null }] as const).map((item) => <button type="button" role="tab" id={`studio-tab-${item.id}`} aria-controls={`studio-panel-${item.id}`} aria-selected={tab === item.id} key={item.id} className={`flex items-center gap-2 border-b-2 py-5 text-sm font-semibold transition-colors ${tab === item.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`} onClick={() => setTab(item.id)}>{item.title}{item.count && <span className="rounded bg-soft px-1.5 py-0.5 text-[10px] font-medium text-muted">{item.count}</span>}</button>)}
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-positive"><span className={`h-1.5 w-1.5 rounded-full bg-positive ${generating ? "animate-pulse" : ""}`} /><span role="status">{generating ? "Подбираем примеры" : "Демо-результат"}</span></span>
            </div>

            {tab === "ideas" ? <section role="tabpanel" id="studio-panel-ideas" aria-labelledby="studio-tab-ideas" className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-muted"><PlatformBadge platform={resultBrief.platform} /><span className="rounded-md bg-soft px-2 py-1">{resultBrief.duration} секунд</span><span className="rounded-md bg-soft px-2 py-1">{resultBrief.tone}</span></div>
              <div className="space-y-3">
                {ideas.map((idea, index) => <button type="button" key={index} aria-pressed={selected === index} onClick={() => { setSelected(index); setSaved(false); }} className={`group relative flex w-full gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5 ${selected === index ? "border-accent/65 bg-[#fff8f4]" : "border-border hover:border-ink/20 hover:bg-canvas"}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${selected === index ? "bg-accent text-white" : "bg-soft text-muted"}`}>0{index + 1}</span>
                  <span className="min-w-0 flex-1"><span className="mb-1 block text-[10px] font-medium uppercase tracking-[.1em] text-muted">{idea.format}</span><span className="block pr-4 text-[15px] font-semibold leading-snug tracking-tight">{idea.title}</span><span className="mt-2 block text-xs leading-relaxed text-muted">{idea.angle}</span><span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[10px] text-ink/65"><Icon name="clock" size={11} />{resultBrief.duration} сек<span className="mx-1 text-border">/</span>4 сцены</span></span>
                  <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected === index ? "border-accent bg-accent text-white" : "border-border"}`}>{selected === index && <Icon name="check" size={12} />}</span>
                </button>)}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><p className="max-w-[250px] text-[11px] leading-relaxed text-muted">Выберите идею — дальше её можно<br className="hidden sm:block" /> превратить в свой сценарий.</p><button type="button" className="btn btn-primary" onClick={() => setTab("script")}>Открыть сценарий<Icon name="arrow-right" size={16} /></button></div>
            </section> : <section role="tabpanel" id="studio-panel-script" aria-labelledby="studio-tab-script" className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 max-w-full flex-1"><span className="section-kicker">{activeIdea.format}</span>{editing ? <input aria-label="Название сценария" className="input mt-2 font-semibold" value={activeIdea.title} onChange={(event) => updateIdea("title", event.target.value)} /> : <h2 className="mt-1 text-xl font-semibold leading-snug tracking-tight">{activeIdea.title}</h2>}<div className="mt-2 flex items-center gap-3 text-[11px] text-muted"><PlatformBadge platform={resultBrief.platform} compact /><span>{resultBrief.duration} секунд</span><span>4 сцены</span></div></div>
                <button type="button" aria-pressed={editing} className="btn btn-ghost shrink-0 text-xs" onClick={() => setEditing(!editing)}><Icon name={editing ? "check" : "edit"} size={15} />{editing ? "Готово" : "Изменить"}</button>
              </div>
              <div className="rounded-xl border border-[#f2dfcc] bg-[#fff7ee] p-4"><span className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#aa7448]"><Icon name="sparkles" size={13} />Первые секунды решают</span>{editing ? <textarea aria-label="Вступление сценария" className="input min-h-[88px] bg-white/80" value={activeIdea.hook} onChange={(event) => updateIdea("hook", event.target.value)} /> : <p className="text-sm font-medium leading-relaxed text-[#76563b]">«{activeIdea.hook}»</p>}</div>
              <div className="mt-6 space-y-5">
                {activeIdea.scenes.map((scene, index) => <div key={index} className="relative flex gap-3 sm:gap-4">
                  {index < activeIdea.scenes.length - 1 && <div aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-12px)] w-px bg-border" />}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-[10px] font-semibold text-muted">0{index + 1}</span>
                  <div className="min-w-0 flex-1 pb-1"><div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="text-xs font-semibold">{scene.title}</h3><span className="text-[10px] text-muted">{scene.time}</span></div><div className="grid gap-3 rounded-xl bg-canvas p-3.5 sm:grid-cols-2"><div><label htmlFor={`scene-${index}-visual`} className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-muted">В кадре</label>{editing ? <textarea id={`scene-${index}-visual`} className="input min-h-[150px] bg-white text-xs leading-relaxed" value={scene.visual} onChange={(event) => updateScene(index, "visual", event.target.value)} /> : <p className="text-[11px] leading-relaxed text-ink/80">{scene.visual}</p>}</div><div><label htmlFor={`scene-${index}-voice`} className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-muted">Озвучивание</label>{editing ? <textarea id={`scene-${index}-voice`} className="input min-h-[150px] bg-white text-xs leading-relaxed" value={scene.voice} onChange={(event) => updateScene(index, "voice", event.target.value)} /> : <p className="text-[11px] leading-relaxed text-ink/80">{scene.voice}</p>}</div></div></div>
                </div>)}
              </div>
              <div className="mt-5 border-t border-border pt-5"><label htmlFor="script-cta" className="field-label">Призыв к действию</label>{editing ? <textarea id="script-cta" className="input min-h-[75px]" value={activeIdea.cta} onChange={(event) => updateIdea("cta", event.target.value)} /> : <p className="text-xs leading-relaxed text-ink/80">{activeIdea.cta}</p>}</div>
              <div className="mt-4"><label htmlFor="script-description" className="field-label">Описание публикации</label>{editing ? <textarea id="script-description" className="input min-h-[95px]" value={activeIdea.description} onChange={(event) => updateIdea("description", event.target.value)} /> : <p className="text-xs leading-relaxed text-ink/80">{activeIdea.description}</p>}</div>
              <div className="mt-3">{editing ? <><label className="field-label" htmlFor="script-hashtags">Хештеги</label><input id="script-hashtags" className="input" value={activeIdea.hashtags} onChange={(event) => updateIdea("hashtags", event.target.value)} /></> : <p className="text-xs leading-relaxed text-accent">{activeIdea.hashtags}</p>}</div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><div className="flex gap-2"><button type="button" className="btn btn-secondary !px-3 text-xs" onClick={copyScript}><Icon name="copy" size={15} />Копировать</button><button type="button" className="btn btn-secondary !px-3 text-xs" onClick={downloadScript} aria-label="Скачать сценарий текстовым файлом"><Icon name="download" size={15} /><span className="hidden sm:inline">Скачать</span></button></div><button type="button" className="btn btn-primary text-xs" onClick={saveDraft}><Icon name={saved ? "check" : "bookmark"} size={16} />{saved ? "Сохранено" : "Сохранить черновик"}</button></div>
            </section>}
          </Panel>
          <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-muted"><Icon name="info" size={13} className="mt-0.5 shrink-0" />Это демонстрационные сценарии. Перед публикацией добавьте детали вашего бренда и проверьте факты.</p>
        </div>
      </div>

      <Modal open={draftsOpen} onClose={() => setDraftsOpen(false)} title="Ваши черновики" description="Сценарии, сохранённые в этом браузере.">
        {drafts.length === 0 ? <EmptyState title="Здесь будут ваши истории" description="Откройте сценарий и сохраните первый черновик. Он появится в этом списке."><button type="button" className="btn btn-primary mt-4" onClick={() => { setDraftsOpen(false); setTab("script"); }}>К сценарию<Icon name="arrow-right" size={15} /></button></EmptyState> : <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">{drafts.map((draft) => <div key={draft.id} className="flex items-center gap-3 rounded-xl border border-border p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e9] text-accent"><Icon name="bookmark" size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{draft.ideas[draft.selected].title}</p><p className="mt-1 text-[10px] text-muted">{draft.brief.platform} · {draft.brief.duration} сек · {new Date(draft.savedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p></div><button type="button" className="btn btn-secondary !px-3 !py-2 text-xs" onClick={() => loadDraft(draft)}>Открыть</button><button type="button" className="btn btn-ghost !p-2 text-muted hover:!text-accent" aria-label={`Удалить черновик «${draft.ideas[draft.selected].title}»`} onClick={() => deleteDraft(draft.id)}><Icon name="trash" size={16} /></button></div>)}</div>}
      </Modal>
    </div>
  );
}
