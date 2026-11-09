import type { ActivityStats } from '../../types/activity';

interface ActivityStatsCardsProps {
  stats?: ActivityStats;
}

export function ActivityStatsCards({ stats }: ActivityStatsCardsProps) {
  const cards = [
    { label: 'Total', value: stats?.total ?? 0 },
    { label: 'Hoje', value: stats?.todayTotal ?? 0 },
    { label: 'Abertas', value: stats?.openTaskRefs.length ?? 0 },
    {
      label: 'Completed',
      value: stats?.byStatus.completed ?? 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="activity-stats">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
        >
          <div className="text-[11px] uppercase tracking-wide text-slate-400">{card.label}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-50">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
