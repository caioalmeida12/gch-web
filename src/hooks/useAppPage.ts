import { useCallback, useState } from 'react';

export type AppPage = 'activity' | 'browser';

export function useAppPage(initial: AppPage = 'activity') {
  const [page, setPageState] = useState<AppPage>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'browser' || hash === 'activity') return hash;
    return initial;
  });

  const setPage = useCallback((next: AppPage) => {
    setPageState(next);
    window.location.hash = next;
  }, []);

  return [page, setPage] as const;
}
