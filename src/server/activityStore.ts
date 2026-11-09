import fs from 'fs';
import path from 'path';
import type {
  ActivityCalendarModel,
  ActivityEntry,
  ActivityFilters,
  ActivityStats,
} from '../types/activity.js';
import { buildActivityCalendar } from '../utils/activityCalendar.js';
import {
  buildActivityStats,
  filterActivityEntries,
  listActivityDates,
} from '../utils/activityStats.js';
import { parseActivityJsonl } from '../utils/parseActivityJsonl.js';

export interface ActivityResponse {
  entries: ActivityEntry[];
  stats: ActivityStats;
  calendar: ActivityCalendarModel;
  meta: { from: string; to: string; days: number; root: string };
}

function readDayFile(logsDir: string, dateKey: string): ActivityEntry[] {
  const filePath = path.join(logsDir, `${dateKey}.jsonl`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  return parseActivityJsonl(raw);
}

export function loadActivityEntries(
  logsDir: string,
  days: number,
  now: Date = new Date(),
): ActivityEntry[] {
  const dates = listActivityDates(now.toISOString(), days);
  const entries: ActivityEntry[] = [];
  for (const date of dates) {
    entries.push(...readDayFile(logsDir, date));
  }
  return entries.toSorted((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function buildActivityResponse(
  logsDir: string,
  filters: ActivityFilters = {},
  now: Date = new Date(),
): ActivityResponse {
  const days = Math.max(1, Number(filters.days) || 7);
  const loaded = loadActivityEntries(logsDir, days, now);
  const entries = filterActivityEntries(loaded, { ...filters, days }, now);
  const stats = buildActivityStats(entries, now.toISOString());
  const calendar = buildActivityCalendar(loaded, {
    weeks: Math.max(1, Math.ceil(days / 7)),
    now,
  });
  const dates = listActivityDates(now.toISOString(), days);

  return {
    entries,
    stats,
    calendar,
    meta: {
      from: dates[0] || now.toISOString().slice(0, 10),
      to: dates[dates.length - 1] || now.toISOString().slice(0, 10),
      days,
      root: logsDir,
    },
  };
}
