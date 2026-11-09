import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAppPage } from './hooks/useAppPage';
import { ActivityPage } from './views/ActivityPage';
import { BrowserPage } from './views/BrowserPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const [page, setPage] = useAppPage();
  if (page === 'browser') {
    return <BrowserPage page={page} onChangePage={setPage} />;
  }
  return <ActivityPage page={page} onChangePage={setPage} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
