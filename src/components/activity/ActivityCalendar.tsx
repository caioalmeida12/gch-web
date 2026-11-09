import type { ActivityCalendarModel } from '../../types/activity';

interface ActivityCalendarProps {
  model: ActivityCalendarModel;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-slate-800',
  1: 'bg-teal-900',
  2: 'bg-teal-700',
  3: 'bg-teal-500',
  4: 'bg-teal-300',
};

export function ActivityCalendar({ model, selectedDate, onSelectDate }: ActivityCalendarProps) {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
      data-testid="activity-calendar"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Calendário</h2>
          <p className="text-xs text-slate-400">
            {model.total} entradas · {model.activeDays} dias ativos · {model.from} → {model.to}
          </p>
        </div>
        {selectedDate && (
          <button
            type="button"
            className="text-xs text-teal-300 hover:underline"
            onClick={() => onSelectDate(null)}
          >
            limpar {selectedDate}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {model.weeks.map((week) => (
            <div key={week[0]?.date || Math.random()} className="flex flex-col gap-1">
              {week.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  title={`${day.date}: ${day.count}`}
                  disabled={!day.inRange}
                  onClick={() => onSelectDate(selectedDate === day.date ? null : day.date)}
                  className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[day.level]} ${
                    selectedDate === day.date ? 'ring-2 ring-teal-200' : ''
                  } ${day.inRange ? 'hover:ring-1 hover:ring-teal-400' : 'opacity-20'}`}
                  data-testid={`cal-day-${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
