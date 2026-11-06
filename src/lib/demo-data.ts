// Демонстрационные данные. Все аккаунты, показатели и люди вымышлены.

export type Platform = "TikTok" | "Instagram";

export type Project = {
  id: string;
  name: string;
  goal: string;
  platforms: Platform[];
  status: "Активный" | "На паузе" | "Завершён";
  competitors: number;
  videos: number;
  updated: string;
  history: { date: string; text: string }[];
};

export const demoProjects: Project[] = [
  { id: "slow-coffee", name: "SLOW Coffee — запуск в соцсетях", goal: "Найти форматы коротких видео, которые приводят новую аудиторию в кофейню в Алматы.", platforms: ["Instagram", "TikTok"], status: "Активный", competitors: 5, videos: 127, updated: "30 окт 2026", history: [{ date: "30 окт", text: "Обновлена выборка: 127 публикаций" }, { date: "24 окт", text: "Сформирован AI Summary за октябрь" }, { date: "12 окт", text: "Добавлен конкурент @drip.stories" }, { date: "1 окт", text: "Проект создан" }] },
  { id: "autumn-menu", name: "Осеннее меню", goal: "Проверить, какие ролики о сезонных напитках собирают больше сохранений.", platforms: ["Instagram"], status: "Активный", competitors: 3, videos: 48, updated: "27 окт 2026", history: [{ date: "27 окт", text: "Добавлены хештеги #осеннеекофе, #pumpkinlatte" }, { date: "15 окт", text: "Проект создан" }] },
  { id: "barista-stories", name: "Истории бариста", goal: "Понять, как люди за стойкой помогают вовлечению аудитории.", platforms: ["TikTok"], status: "На паузе", competitors: 2, videos: 31, updated: "9 окт 2026", history: [{ date: "9 окт", text: "Проект поставлен на паузу" }, { date: "20 сен", text: "Проект создан" }] },
];

export type Video = { id: string; title: string; account: string; platform: Platform; views: number; likes: number; comments: number; shares: number; saves: number | null; followers: number; duration: number; date: string; tags: string[]; topic: string };

export const demoVideos: Video[] = [
  { id: "v1", title: "Маленький ритуал большого города", account: "daily.brew", platform: "TikTok", views: 184200, likes: 15100, comments: 920, shares: 1240, saves: null, followers: 24600, duration: 24, date: "2026-10-22", tags: ["#coffeetime", "#утреннийритуал"], topic: "Кофейные ритуалы" },
  { id: "v2", title: "По ту сторону кофейной стойки", account: "slowclub.coffee", platform: "Instagram", views: 126800, likes: 8900, comments: 640, shares: 510, saves: 1320, followers: 38200, duration: 31, date: "2026-10-18", tags: ["#бариста", "#slowmorning"], topic: "Люди за стойкой" },
  { id: "v3", title: "Кофе без спешки: 3 простых шага", account: "bean.and.co", platform: "Instagram", views: 98600, likes: 6100, comments: 430, shares: 390, saves: 1630, followers: 51400, duration: 19, date: "2026-10-15", tags: ["#кофеалматы", "#homebrew"], topic: "Как выбрать кофе" },
  { id: "v4", title: "Три мифа про эспрессо", account: "drip.stories", platform: "TikTok", views: 72400, likes: 5300, comments: 780, shares: 610, saves: null, followers: 18200, duration: 42, date: "2026-10-09", tags: ["#coffeetime", "#мифыокофе"], topic: "Как выбрать кофе" },
  { id: "v5", title: "Город просыпается", account: "mood.espresso", platform: "Instagram", views: 41300, likes: 2200, comments: 140, shares: 90, saves: 380, followers: 12900, duration: 15, date: "2026-10-03", tags: ["#slowmorning", "#кофеалматы"], topic: "Кофейные ритуалы" },
  { id: "v6", title: "Как мы обжариваем зерно", account: "bean.and.co", platform: "Instagram", views: 67200, likes: 4100, comments: 290, shares: 260, saves: 910, followers: 51400, duration: 36, date: "2026-09-28", tags: ["#бариста", "#обжарка"], topic: "Люди за стойкой" },
  { id: "v7", title: "Латте-арт за 20 секунд", account: "daily.brew", platform: "TikTok", views: 151000, likes: 12700, comments: 560, shares: 980, saves: null, followers: 24600, duration: 20, date: "2026-09-21", tags: ["#латтеарт", "#coffeetime"], topic: "Кофейные ритуалы" },
];

export type Comment = { id: string; video: string; author: string; text: string; sentiment: "positive" | "neutral" | "negative"; category: string; lang: "ru" | "en" };

export const demoComments: Comment[] = [
  { id: "c1", video: "v1", author: "aigerim_k", text: "Как называется этот сироп? Хочу повторить дома", sentiment: "neutral", category: "Вопросы о товаре", lang: "ru" },
  { id: "c2", video: "v1", author: "coffee.nomad", text: "Любимое видео недели, такое спокойное", sentiment: "positive", category: "Положительные отзывы", lang: "ru" },
  { id: "c3", video: "v2", author: "dana.b", text: "Сколько стоит такой флэт уайт?", sentiment: "neutral", category: "Вопросы о цене", lang: "ru" },
  { id: "c4", video: "v2", author: "ruslan_a", text: "Сделайте вторую часть про обжарку!", sentiment: "positive", category: "Запросы на продолжение", lang: "ru" },
  { id: "c5", video: "v3", author: "mila_cup", text: "Шаг с водой не объяснили, получилось горько", sentiment: "negative", category: "Критика", lang: "ru" },
  { id: "c6", video: "v3", author: "brew_dad", text: "Super useful, saved for later", sentiment: "positive", category: "Положительные отзывы", lang: "en" },
  { id: "c7", video: "v4", author: "samat.q", text: "А цена зерна в этом месяце какая?", sentiment: "neutral", category: "Вопросы о цене", lang: "ru" },
  { id: "c8", video: "v4", author: "lera.coffee", text: "Миф номер два — спорно, есть другие данные", sentiment: "negative", category: "Критика", lang: "ru" },
  { id: "c9", video: "v7", author: "nika_art", text: "Покажите ещё замедленную съёмку, пожалуйста", sentiment: "positive", category: "Запросы на продолжение", lang: "ru" },
  { id: "c10", video: "v6", author: "tim.roast", text: "Какая степень обжарки у эфиопии?", sentiment: "neutral", category: "Вопросы о товаре", lang: "ru" },
];

export const commentActions: Record<string, string> = {
  "Вопросы о товаре": "Создать видео с ответами",
  "Вопросы о цене": "Подготовить обзор цен",
  "Положительные отзывы": "Использовать тему в следующих публикациях",
  "Критика": "Подготовить объективное сравнение",
  "Запросы на продолжение": "Разработать продолжение ролика",
};

export type Hashtag = { tag: string; posts: number; avgViews: number; er: number; niche: number; related: string[] };

export const demoHashtags: Hashtag[] = [
  { tag: "#coffeetime", posts: 34, avgViews: 118000, er: 8.4, niche: 92, related: ["#утреннийритуал", "#латтеарт"] },
  { tag: "#бариста", posts: 22, avgViews: 84000, er: 7.7, niche: 96, related: ["#slowmorning", "#обжарка"] },
  { tag: "#slowmorning", posts: 19, avgViews: 61000, er: 7.1, niche: 88, related: ["#бариста", "#кофеалматы"] },
  { tag: "#кофеалматы", posts: 27, avgViews: 52000, er: 6.2, niche: 99, related: ["#slowmorning", "#homebrew"] },
  { tag: "#утреннийритуал", posts: 15, avgViews: 97000, er: 9.0, niche: 81, related: ["#coffeetime"] },
  { tag: "#латтеарт", posts: 11, avgViews: 133000, er: 8.1, niche: 74, related: ["#coffeetime"] },
];

export type Member = { id: string; name: string; email: string; role: Role; project: string; status: "Активен" | "Приглашён" };
export type Role = "Владелец" | "SMM-специалист" | "Аналитик" | "Контент-креатор" | "Наблюдатель";
export const roles: Role[] = ["Владелец", "SMM-специалист", "Аналитик", "Контент-креатор", "Наблюдатель"];

export const demoMembers: Member[] = [
  { id: "m1", name: "Айдана Серикова", email: "aidana@slow.example", role: "Владелец", project: "Все проекты", status: "Активен" },
  { id: "m2", name: "Тимур Ахметов", email: "timur@slow.example", role: "SMM-специалист", project: "SLOW Coffee", status: "Активен" },
  { id: "m3", name: "Мадина Касымова", email: "madina@slow.example", role: "Аналитик", project: "SLOW Coffee", status: "Активен" },
  { id: "m4", name: "Арман Жексенов", email: "arman@slow.example", role: "Контент-креатор", project: "Осеннее меню", status: "Приглашён" },
];

// Матрица прав из ТЗ (п. 5.2): true — «Да», "own" — «Свой», false — «Нет».
export type Access = true | "own" | false;
export const permissionMatrix: { feature: string; access: Access[] }[] = [
  { feature: "Создание проектов", access: [true, "own", false, false, false] },
  { feature: "Добавление конкурентов", access: [true, "own", "own", false, false] },
  { feature: "Запуск анализа публикаций", access: [true, "own", "own", false, false] },
  { feature: "Анализ комментариев", access: [true, "own", "own", false, false] },
  { feature: "Анализ хештегов", access: [true, "own", "own", false, false] },
  { feature: "Просмотр отчётов", access: [true, "own", "own", "own", "own"] },
  { feature: "Генерация сценариев", access: [true, "own", false, "own", false] },
  { feature: "Создание видеочерновиков", access: [true, "own", false, "own", false] },
  { feature: "Редактирование видеоматериалов", access: [true, "own", false, "own", false] },
  { feature: "Утверждение контента", access: [true, false, false, false, false] },
  { feature: "Экспорт разрешённых отчётов", access: [true, "own", "own", false, false] },
];

export const compactNumber = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(value);
export const percent = (value: number | null) => value === null ? "—" : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
