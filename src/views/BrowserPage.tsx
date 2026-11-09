import { useMemo, useState } from 'react';
import {
  ChevronRight,
  FilePlus2,
  Folder,
  FileText,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react';
import { AppNav } from '../components/layout/AppNav';
import { useNodeList, useNodeMutations, useNodeRead } from '../hooks/entities/useNodes';
import type { AppPage } from '../hooks/useAppPage';

interface BrowserPageProps {
  page: AppPage;
  onChangePage: (page: AppPage) => void;
}

function parentPath(path: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

export function BrowserPage({ page, onChangePage }: BrowserPageProps) {
  const [dirPath, setDirPath] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const listQuery = useNodeList(dirPath);
  const readQuery = useNodeRead(selectedPath, details);
  const { save, remove } = useNodeMutations(dirPath);

  const crumbs = useMemo(() => {
    const parts = dirPath ? dirPath.split('/').filter(Boolean) : [];
    const items = [{ label: 'GCH_ROOT', path: '' }];
    let acc = '';
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      items.push({ label: part, path: acc });
    }
    return items;
  }, [dirPath]);

  const content = readQuery.data?.content ?? '';
  const editorValue = creating ? draft : draft || content;

  function openFile(path: string) {
    setCreating(false);
    setSelectedPath(path);
    setDraft('');
    setDetails(false);
  }

  function startCreate() {
    setCreating(true);
    setSelectedPath(null);
    setNewName('');
    setDraft('# Novo nó\n\n---\n\n');
    setDetails(true);
  }

  async function handleSave() {
    const target = creating
      ? [dirPath, newName].filter(Boolean).join('/')
      : selectedPath;
    if (!target) return;
    if (creating && !newName.trim()) return;
    await save.mutateAsync({ path: target, content: editorValue });
    setCreating(false);
    setSelectedPath(target);
    setDraft('');
  }

  async function handleDelete() {
    if (!selectedPath) return;
    if (!window.confirm(`Apagar ${selectedPath}?`)) return;
    await remove.mutateAsync(selectedPath);
    setSelectedPath(null);
    setDraft('');
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100" data-testid="browser-page">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">GCH Web</h1>
            <span className="rounded border border-teal-800 bg-teal-950 px-2 py-0.5 font-mono text-[10px] text-teal-300">
              arquivos
            </span>
          </div>
          <p className="text-xs text-slate-400">Browser read/write sob GCH_ROOT</p>
        </div>
        <AppNav page={page} onChange={onChangePage} />
      </header>

      <main className="grid min-h-[calc(100vh-57px)] grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950/40 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            {crumbs.map((crumb, idx) => (
              <span key={crumb.path || 'root'} className="inline-flex items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <button
                  type="button"
                  className="hover:text-teal-300"
                  onClick={() => {
                    setDirPath(crumb.path);
                    setSelectedPath(null);
                    setCreating(false);
                  }}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-1 rounded border border-teal-800 bg-teal-950/40 px-2 py-1 text-xs text-teal-200 hover:bg-teal-900/40"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              Novo .md
            </button>
            {dirPath && (
              <button
                type="button"
                onClick={() => setDirPath(parentPath(dirPath))}
                className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              >
                ↑ subir
              </button>
            )}
          </div>

          {listQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> carregando
            </div>
          ) : (
            <ul className="space-y-1">
              {(listQuery.data?.entries || []).map((entry) => (
                <li key={entry.path}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-800 ${
                      selectedPath === entry.path ? 'bg-slate-800 text-teal-200' : 'text-slate-200'
                    }`}
                    onClick={() => {
                      if (entry.type === 'directory') {
                        setDirPath(entry.path);
                        setSelectedPath(null);
                        setCreating(false);
                      } else {
                        openFile(entry.path);
                      }
                    }}
                  >
                    {entry.type === 'directory' ? (
                      <Folder className="h-4 w-4 text-amber-300" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="truncate">{entry.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex flex-col p-4">
          {(selectedPath || creating) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {creating ? (
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="caminho/arquivo.md"
                  className="min-w-[220px] flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-xs"
                />
              ) : (
                <code className="font-mono text-xs text-teal-300">{selectedPath}</code>
              )}
              {!creating && readQuery.data?.hasDetails && (
                <label className="ml-auto flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={details}
                    onChange={(e) => {
                      setDetails(e.target.checked);
                      setDraft('');
                    }}
                  />
                  detalhes
                </label>
              )}
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={save.isPending}
                className="inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar
              </button>
              {selectedPath && !creating && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={remove.isPending}
                  className="inline-flex items-center gap-1 rounded border border-rose-800 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Apagar
                </button>
              )}
            </div>
          )}

          {readQuery.isLoading && selectedPath && !creating ? (
            <div className="py-12 text-center text-sm text-slate-400">Carregando nó…</div>
          ) : selectedPath || creating ? (
            <textarea
              value={editorValue}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[70vh] flex-1 resize-y rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-sm leading-relaxed text-slate-100"
              spellCheck={false}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              Selecione um arquivo ou crie um novo markdown
            </div>
          )}

          {(save.isError || remove.isError) && (
            <p className="mt-2 text-xs text-rose-300">
              {(save.error || remove.error)?.message || 'Erro'}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
