import { useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { ActivityCalendar } from '../components/activity/ActivityCalendar';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { ActivityFiltersBar } from '../components/activity/ActivityFilters';
import { ActivityStatsCards } from '../components/activity/ActivityStatsCards';
import { AppNav } from '../components/layout/AppNav';
import { useActivity } from '../hooks/entities/useActivity';
import type { AppPage } from '../hooks/useAppPage';
import type { ActivityFilters } from '../types/activity';
import { buildActivityStats } from '../utils/activityStats';

interface ActivityPageProps {
  page: AppPage;
  onChangePage: (page: AppPage) => void;
}

export function ActivityPage({ page, onChangePage }: ActivityPageProps) {
  const [filters, setFilters] = useState<ActivityFilters>({ days: 30, tag: '', status: '', agent: '', q: '' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { entries, stats, calendar, meta, isLoading, isFetching, isError, error, refetch } =
    useActivity(filters);

  const feedEntries = useMemo(() => {
    if (!selectedDate) return entries;
    return entries.filter((entry) => entry.timestamp.slice(0, 10) === selectedDate);
  }, [entries, selectedDate]);

  const feedStats = useMemo(() => {
    if (!selectedDate) return stats;
    return buildActivityStats(feedEntries, selectedDate);
  }, [selectedDate, stats, feedEntries]);

  const tags = Object.keys(stats?.byTag || {}).toSorted();
  const agents = Object.keys(stats?.byAgent || {}).toSorted();

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100" data-testid="activity-page">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">GCH Web</h1>
            <span className="rounded border border-teal-800 bg-teal-950 px-2 py-0.5 font-mono text-[10px] text-teal-300">
              atividade
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Histórico do activity log
            {meta ? ` · ${meta.from} → ${meta.to}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AppNav page={page} onChange={onChangePage} />
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            data-testid="activity-refresh"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-300" />
            ) : (
              <RefreshCw className="h-4 w-4 text-teal-300" />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
        {isError && (
          <div className="rounded border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {error instanceof Error ? error.message : 'Erro ao carregar activity'}
          </div>
        )}
        <ActivityStatsCards stats={feedStats} />
        <ActivityFiltersBar
          filters={filters}
          tags={tags}
          agents={agents}
          onChange={(next) => {
            setSelectedDate(null);
            setFilters(next);
          }}
        />
        {calendar && (
          <ActivityCalendar
            model={calendar}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando…</div>
        ) : (
          <ActivityFeed entries={feedEntries} openTaskRefs={feedStats?.openTaskRefs} />
        )}
      </main>
    </div>
  );
}
