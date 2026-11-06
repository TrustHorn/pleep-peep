import { demoVideos, type Video } from "./demo-data";

export type DateRange = { from: string; to: string };
const DAY = 86_400_000;
export const DEMO_LAST_DATE = demoVideos.reduce((latest, video) => video.date > latest ? video.date : latest, "");
export const DEMO_FIRST_DATE = demoVideos.reduce((first, video) => video.date < first ? video.date : first, DEMO_LAST_DATE);

export function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().split("T")[0];
}

export function presetDateRange(days: number): DateRange {
  return { from: shiftDate(DEMO_LAST_DATE, 1 - days), to: DEMO_LAST_DATE };
}

export const DEFAULT_DATE_RANGE = presetDateRange(30);

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isValidDateRange(range: unknown): range is DateRange {
  if (!range || typeof range !== "object" || !("from" in range) || !("to" in range)) return false;
  return isDate(range.from) && isDate(range.to) && range.from <= range.to;
}

export function dateRangeDays(range: DateRange) {
  return Math.round((Date.parse(`${range.to}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / DAY) + 1;
}

export function previousDateRange(range: DateRange): DateRange {
  return { from: shiftDate(range.from, -dateRangeDays(range)), to: shiftDate(range.from, -1) };
}

export function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: short ? "short" : "2-digit", ...(short ? {} : { year: "numeric" as const }), timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export const formatDateRange = (range: DateRange) => `${formatDate(range.from)} — ${formatDate(range.to)}`;
export const filterVideosByDateRange = (range: DateRange, videos: Video[] = demoVideos) => videos.filter((video) => video.date >= range.from && video.date <= range.to);

export function summarizeVideos(videos: Video[]) {
  const views = videos.reduce((sum, video) => sum + video.views, 0);
  const likes = videos.reduce((sum, video) => sum + video.likes, 0);
  const comments = videos.reduce((sum, video) => sum + video.comments, 0);
  const interactions = videos.reduce((sum, video) => sum + video.likes + video.comments + video.shares + (video.saves ?? 0), 0);
  return { views, likes, comments, interactions, videos: videos.length, er: views ? interactions / views * 100 : 0 };
}

export function accountDateRangeStats<T extends { handle: string; platform: string; views: number | null; videos: number | null; interactions: number | null; growth: number | null }>(account: T, range: DateRange) {
  const source = demoVideos.filter((video) => video.account === account.handle && video.platform === account.platform);
  if (!source.length) return { ...account, views: null, videos: null, interactions: null, growth: null, likes: null, comments: null };
  const current = summarizeVideos(filterVideosByDateRange(range, source));
  const previous = summarizeVideos(filterVideosByDateRange(previousDateRange(range), source));
  return { ...account, ...current, growth: previous.views ? (current.views - previous.views) / previous.views * 100 : null };
}
