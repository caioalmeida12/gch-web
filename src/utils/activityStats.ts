import type {
  ActivityEntry,
  ActivityFilters,
  ActivityStats,
  ActivityStatus,
  OpenTaskRef,
} from '../types/activity.js';

function toDateKey(isoOrDate: string | Date): string {
  if (typeof isoOrDate === 'string') return isoOrDate.slice(0, 10);
  return isoOrDate.toISOString().slice(0, 10);
}

export function listActivityDates(anchorDate: string, days: number): string[] {
  const safeDays = Math.max(1, Math.floor(days));
  const anchor = new Date(`${toDateKey(anchorDate)}T00:00:00.000Z`);
  const dates: string[] = [];
  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const d = new Date(anchor);
    d.setUTCDate(anchor.getUTCDate() - offset);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function filterActivityEntries(
  entries: ActivityEntry[],
  filters: ActivityFilters = {},
  now: Date = new Date(),
): ActivityEntry[] {
  const tag = (filters.tag || '').trim();
  const status = (filters.status || '').trim();
  const agent = (filters.agent || '').trim();
  const q = (filters.q || '').trim().toLowerCase();
  const days = Math.max(1, Number(filters.days) || 7);
  const dates = new Set(listActivityDates(now.toISOString(), days));

  return entries.filter((entry) => {
    if (!dates.has(toDateKey(entry.timestamp))) return false;
    if (tag && entry.tag !== tag) return false;
    if (status && entry.status !== status) return false;
    if (agent && entry.agent !== agent) return false;
    if (q) {
      const haystack = [
        entry.description,
        entry.summary,
        entry.task_ref || '',
        entry.tag,
        entry.agent,
        entry.status,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function buildActivityStats(entries: ActivityEntry[], todayDate: string): ActivityStats {
  const todayKey = toDateKey(todayDate);
  const byStatus: Partial<Record<ActivityStatus, number>> = {};
  const byTag: Record<string, number> = {};
  const byAgent: Record<string, number> = {};
  let todayTotal = 0;

  const latestByRef = new Map<string, ActivityEntry>();

  for (const entry of entries) {
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    byTag[entry.tag] = (byTag[entry.tag] || 0) + 1;
    byAgent[entry.agent] = (byAgent[entry.agent] || 0) + 1;
    if (toDateKey(entry.timestamp) === todayKey) todayTotal += 1;

    if (entry.task_ref) {
      const prev = latestByRef.get(entry.task_ref);
      if (!prev || entry.timestamp > prev.timestamp) {
        latestByRef.set(entry.task_ref, entry);
      }
    }
  }

  const openTaskRefs: OpenTaskRef[] = [...latestByRef.entries()]
    .filter(([, entry]) => entry.status === 'started')
    .map(([task_ref, entry]) => ({
      task_ref,
      description: entry.description,
      agent: entry.agent,
      tag: entry.tag,
      timestamp: entry.timestamp,
    }))
    .toSorted((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return {
    total: entries.length,
    todayTotal,
    byStatus,
    byTag,
    byAgent,
    openTaskRefs,
  };
}
