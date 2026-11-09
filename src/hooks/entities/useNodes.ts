import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NodeListEntry, NodeReadResult } from '../../types/nodes';

async function fetchNodes(path: string): Promise<{ path: string; entries: NodeListEntry[] }> {
  const params = new URLSearchParams({ path });
  const res = await fetch(`/api/nodes?${params.toString()}`);
  if (!res.ok) throw new Error(`nodes ${res.status}`);
  return res.json() as Promise<{ path: string; entries: NodeListEntry[] }>;
}

async function fetchNodeRead(path: string, details: boolean): Promise<NodeReadResult> {
  const params = new URLSearchParams({
    path,
    details: details ? '1' : '0',
  });
  const res = await fetch(`/api/nodes/read?${params.toString()}`);
  if (!res.ok) throw new Error(`nodes/read ${res.status}`);
  return res.json() as Promise<NodeReadResult>;
}

export function useNodeList(path: string) {
  return useQuery({
    queryKey: ['gch-nodes', path],
    queryFn: () => fetchNodes(path),
  });
}

export function useNodeRead(path: string | null, details: boolean) {
  return useQuery({
    queryKey: ['gch-node-read', path, details],
    queryFn: () => fetchNodeRead(path || '', details),
    enabled: !!path,
  });
}

export function useNodeMutations(listPath: string) {
  const client = useQueryClient();

  const save = useMutation({
    mutationFn: async (input: { path: string; content: string }) => {
      const res = await fetch('/api/nodes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `save ${res.status}`);
      }
      return res.json() as Promise<NodeReadResult>;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['gch-nodes', listPath] });
      void client.invalidateQueries({ queryKey: ['gch-node-read'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (path: string) => {
      const params = new URLSearchParams({ path });
      const res = await fetch(`/api/nodes?${params.toString()}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `delete ${res.status}`);
      }
      return res.json() as Promise<{ path: string; deleted: true }>;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['gch-nodes', listPath] });
      void client.invalidateQueries({ queryKey: ['gch-node-read'] });
    },
  });

  return { save, remove };
}
