import { FolderTree, LayoutDashboard } from 'lucide-react';
import type { AppPage } from '../../hooks/useAppPage';

interface AppNavProps {
  page: AppPage;
  onChange: (page: AppPage) => void;
}

const items: Array<{ id: AppPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'activity', label: 'Atividade', icon: LayoutDashboard },
  { id: 'browser', label: 'Arquivos', icon: FolderTree },
];

export function AppNav({ page, onChange }: AppNavProps) {
  return (
    <nav className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1" data-testid="app-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'bg-teal-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            data-testid={`nav-${item.id}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
