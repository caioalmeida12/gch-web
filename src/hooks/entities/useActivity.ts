import { useQuery } from '@tanstack/react-query';
import type {
  ActivityCalendarModel,
  ActivityEntry,
  ActivityFilters,
  ActivityStats,
} from '../../types/activity';

export interface ActivityPayload {
  entries: ActivityEntry[];
  stats: ActivityStats;
  calendar: ActivityCalendarModel;
  meta: { from: string; to: string; days: number; root: string };
}

async function fetchActivity(filters: ActivityFilters): Promise<ActivityPayload> {
  const params = new URLSearchParams();
  if (filters.days) params.set('days', String(filters.days));
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.status) params.set('status', filters.status);
  if (filters.agent) params.set('agent', filters.agent);
  if (filters.q) params.set('q', filters.q);
  const res = await fetch(`/api/activity?${params.toString()}`);
  if (!res.ok) throw new Error(`activity ${res.status}`);
  return res.json() as Promise<ActivityPayload>;
}

export function useActivity(filters: ActivityFilters) {
  const query = useQuery({
    queryKey: ['gch-activity', filters],
    queryFn: () => fetchActivity(filters),
  });

  return {
    entries: query.data?.entries || [],
    stats: query.data?.stats,
    calendar: query.data?.calendar,
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
