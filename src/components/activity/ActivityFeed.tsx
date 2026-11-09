import { useState } from 'react';
import type { ActivityEntry, OpenTaskRef } from '../../types/activity';

interface ActivityFeedProps {
  entries: ActivityEntry[];
  openTaskRefs?: OpenTaskRef[];
}

const STATUS_COLOR: Record<string, string> = {
  started: 'text-amber-300 border-amber-700 bg-amber-950/40',
  completed: 'text-teal-300 border-teal-700 bg-teal-950/40',
  interrupted: 'text-orange-300 border-orange-700 bg-orange-950/40',
  blocked: 'text-rose-300 border-rose-700 bg-rose-950/40',
};

export function ActivityFeed({ entries, openTaskRefs = [] }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4" data-testid="activity-feed">
      {openTaskRefs.length > 0 && (
        <section className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">Task refs abertas</h3>
          <ul className="space-y-1 text-xs text-amber-100/90">
            {openTaskRefs.map((ref) => (
              <li key={ref.task_ref} className="flex flex-wrap gap-2">
                <code className="rounded bg-slate-950/60 px-1.5 py-0.5 font-mono text-[11px]">
                  {ref.task_ref}
                </code>
                <span>{ref.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold">
          Feed ({entries.length})
        </div>
        <ul className="divide-y divide-slate-800">
          {entries.map((entry) => {
            const key = `${entry.timestamp}-${entry.task_ref || entry.description}`;
            const open = expanded === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-800/40"
                  onClick={() => setExpanded(open ? null : key)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        STATUS_COLOR[entry.status] || ''
                      }`}
                    >
                      {entry.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
                    <span className="text-[11px] text-slate-500">{entry.agent}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {entry.tag}
                    </span>
                    {entry.task_ref && (
                      <code className="font-mono text-[11px] text-teal-300">{entry.task_ref}</code>
                    )}
                  </div>
                  <div className="text-sm text-slate-100">{entry.description}</div>
                </button>
                {open && (
                  <div className="space-y-2 border-t border-slate-800/80 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
                    {entry.summary ? <p className="whitespace-pre-wrap">{entry.summary}</p> : <p>—</p>}
                    {entry.files.length > 0 && (
                      <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                        {entry.files.map((file) => (
                          <li key={`${file.path}-${file.action}`}>
                            [{file.action}] {file.path}
                            {file.reason ? ` — ${file.reason}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {entries.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-500">Nenhuma entrada</li>
          )}
        </ul>
      </section>
    </div>
  );
}
