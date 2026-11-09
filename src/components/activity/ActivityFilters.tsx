import type { ActivityFilters } from '../../types/activity';

interface ActivityFiltersBarProps {
  filters: ActivityFilters;
  tags: string[];
  agents: string[];
  onChange: (next: ActivityFilters) => void;
}

export function ActivityFiltersBar({ filters, tags, agents, onChange }: ActivityFiltersBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
      data-testid="activity-filters"
    >
      <label className="text-xs text-slate-400">
        Dias
        <input
          type="number"
          min={1}
          max={365}
          value={filters.days ?? 30}
          onChange={(e) => onChange({ ...filters, days: Number(e.target.value) || 30 })}
          className="ml-2 w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
        />
      </label>
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
      >
        <option value="">status</option>
        <option value="started">started</option>
        <option value="completed">completed</option>
        <option value="interrupted">interrupted</option>
        <option value="blocked">blocked</option>
      </select>
      <select
        value={filters.tag || ''}
        onChange={(e) => onChange({ ...filters, tag: e.target.value })}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
      >
        <option value="">tag</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select
        value={filters.agent || ''}
        onChange={(e) => onChange({ ...filters, agent: e.target.value })}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
      >
        <option value="">agent</option>
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
      <input
        type="search"
        placeholder="buscar…"
        value={filters.q || ''}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        className="min-w-[180px] flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
      />
    </div>
  );
}
