import type { IncomingMessage, ServerResponse } from 'http';
import type { PluginOption } from 'vite';
import { buildActivityResponse } from './activityStore.js';
import { deleteNode, listNodes, readNode, writeNode } from './gchFs.js';
import { PathEscapeError } from './pathSandbox.js';

function getRoot(): string {
  return process.env.GCH_ROOT || '/mnt/c/Users/caiod/.global-context';
}

function getLogsDir(): string {
  return process.env.GCH_LOGS_DIR || `${getRoot()}/logs`;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function urlOf(req: IncomingMessage): URL {
  return new URL(req.url || '/', 'http://localhost');
}

function handleError(res: ServerResponse, err: unknown): void {
  if (err instanceof PathEscapeError) {
    sendJson(res, 400, { error: err.message });
    return;
  }
  const status =
    typeof err === 'object' && err && 'statusCode' in err
      ? Number((err as { statusCode: number }).statusCode) || 500
      : 500;
  const message = err instanceof Error ? err.message : 'Unknown error';
  sendJson(res, status, { error: message });
}

async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = urlOf(req);
  if (!url.pathname.startsWith('/api/')) return false;

  try {
    if (req.method === 'GET' && url.pathname === '/api/activity') {
      const filters = {
        days: Number(url.searchParams.get('days') || 30),
        tag: url.searchParams.get('tag') || '',
        status: url.searchParams.get('status') || '',
        agent: url.searchParams.get('agent') || '',
        q: url.searchParams.get('q') || '',
      };
      sendJson(res, 200, buildActivityResponse(getLogsDir(), filters));
      return true;
    }

    if (req.method === 'GET' && url.pathname === '/api/nodes') {
      const rel = url.searchParams.get('path') || '';
      sendJson(res, 200, { path: rel, entries: listNodes(getRoot(), rel) });
      return true;
    }

    if (req.method === 'GET' && url.pathname === '/api/nodes/read') {
      const rel = url.searchParams.get('path') || '';
      const details = url.searchParams.get('details') === '1';
      sendJson(res, 200, readNode(getRoot(), rel, details));
      return true;
    }

    if (req.method === 'PUT' && url.pathname === '/api/nodes') {
      const raw = await readBody(req);
      const body = JSON.parse(raw || '{}') as { path?: string; content?: string };
      if (!body.path || typeof body.content !== 'string') {
        sendJson(res, 400, { error: 'path and content required' });
        return true;
      }
      sendJson(res, 200, writeNode(getRoot(), body.path, body.content));
      return true;
    }

    if (req.method === 'DELETE' && url.pathname === '/api/nodes') {
      const rel = url.searchParams.get('path') || '';
      sendJson(res, 200, deleteNode(getRoot(), rel));
      return true;
    }

    sendJson(res, 404, { error: 'Not found' });
    return true;
  } catch (err) {
    handleError(res, err);
    return true;
  }
}

export function gchDevServerPlugin(): PluginOption {
  return {
    name: 'gch-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleApi(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
  };
}
