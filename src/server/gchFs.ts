import fs from 'fs';
import path from 'path';
import type { NodeListEntry, NodeReadResult } from '../types/nodes.js';
import { selectNodeContent } from '../utils/contextBrief.js';
import { resolveSafePath, toRelativePath } from './pathSandbox.js';

export function listNodes(root: string, relativePath = ''): NodeListEntry[] {
  const abs = resolveSafePath(root, relativePath);
  if (!fs.existsSync(abs)) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }
  const stat = fs.statSync(abs);
  if (!stat.isDirectory()) {
    throw Object.assign(new Error('Not a directory'), { statusCode: 400 });
  }

  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((entry) => entry.name !== '.git')
    .map((entry) => {
      const childAbs = path.join(abs, entry.name);
      const childRel = toRelativePath(root, childAbs);
      const isDir = entry.isDirectory();
      let size: number | null = null;
      if (!isDir) {
        try {
          size = fs.statSync(childAbs).size;
        } catch {
          size = null;
        }
      }
      return {
        name: entry.name,
        path: childRel,
        type: isDir ? ('directory' as const) : ('file' as const),
        size,
      };
    })
    .toSorted((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function readNode(
  root: string,
  relativePath: string,
  includeDetails = false,
): NodeReadResult {
  const abs = resolveSafePath(root, relativePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }
  const raw = fs.readFileSync(abs, 'utf8');
  const selected = selectNodeContent(raw, includeDetails);
  return {
    path: toRelativePath(root, abs),
    content: selected.content,
    brief: selected.brief,
    hasDetails: selected.hasDetails,
    detailsIncluded: selected.detailsIncluded,
  };
}

export function writeNode(root: string, relativePath: string, content: string): NodeReadResult {
  if (!relativePath || relativePath.endsWith('/')) {
    throw Object.assign(new Error('Invalid path'), { statusCode: 400 });
  }
  const abs = resolveSafePath(root, relativePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  return readNode(root, relativePath, true);
}

export function deleteNode(root: string, relativePath: string): { path: string; deleted: true } {
  if (!relativePath) {
    throw Object.assign(new Error('Invalid path'), { statusCode: 400 });
  }
  const abs = resolveSafePath(root, relativePath);
  if (!fs.existsSync(abs)) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) {
    throw Object.assign(new Error('Refusing to delete directory'), { statusCode: 400 });
  }
  fs.unlinkSync(abs);
  return { path: toRelativePath(root, abs), deleted: true };
}
