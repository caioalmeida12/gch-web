import type {
  ActivityCalendarDay,
  ActivityCalendarModel,
  ActivityEntry,
} from '../types/activity.js';

function toDateKey(isoOrDate: string | Date): string {
  if (typeof isoOrDate === 'string') return isoOrDate.slice(0, 10);
  return isoOrDate.toISOString().slice(0, 10);
}

function utcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function activityLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function buildActivityCalendar(
  entries: ActivityEntry[],
  options: { weeks?: number; now?: Date } = {},
): ActivityCalendarModel {
  const weeksCount = Math.max(1, Math.floor(options.weeks ?? 53));
  const now = options.now || new Date();
  const todayKey = toDateKey(now);
  const today = utcDate(todayKey);

  const endDow = today.getUTCDay();
  const rangeEnd = addUtcDays(today, 6 - endDow);
  const rangeStart = addUtcDays(rangeEnd, -(weeksCount * 7 - 1));

  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = toDateKey(entry.timestamp);
    if (key < toDateKey(rangeStart) || key > todayKey) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let maxCount = 0;
  for (const value of counts.values()) {
    if (value > maxCount) maxCount = value;
  }

  const days: ActivityCalendarDay[] = [];
  let cursor = rangeStart;
  const totalCells = weeksCount * 7;
  for (let i = 0; i < totalCells; i += 1) {
    const date = toDateKey(cursor);
    const inRange = date <= todayKey;
    const count = inRange ? counts.get(date) || 0 : 0;
    days.push({
      date,
      count,
      level: inRange ? activityLevel(count, maxCount) : 0,
      inRange,
    });
    cursor = addUtcDays(cursor, 1);
  }

  const weeks: ActivityCalendarDay[][] = [];
  for (let w = 0; w < weeksCount; w += 1) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const activeDays = days.filter((d) => d.inRange && d.count > 0).length;
  const total = days.reduce((sum, d) => sum + (d.inRange ? d.count : 0), 0);

  return {
    days,
    weeks,
    total,
    activeDays,
    from: toDateKey(rangeStart),
    to: todayKey,
  };
}
