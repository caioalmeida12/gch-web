import fs from 'fs';
import path from 'path';

export class PathEscapeError extends Error {
  constructor(message = 'Path escapes GCH_ROOT') {
    super(message);
    this.name = 'PathEscapeError';
  }
}

function normalizeRoot(root: string): string {
  return path.resolve(root);
}

/**
 * Resolve `relativePath` under `root`, blocking `..` and symlink escapes.
 * Returns absolute path still under root.
 */
export function resolveSafePath(root: string, relativePath = ''): string {
  const rootAbs = normalizeRoot(root);
  const cleaned = (relativePath || '').replace(/^[/\\]+/, '');
  const candidate = path.resolve(rootAbs, cleaned);

  const rootWithSep = rootAbs.endsWith(path.sep) ? rootAbs : `${rootAbs}${path.sep}`;
  if (candidate !== rootAbs && !candidate.startsWith(rootWithSep)) {
    throw new PathEscapeError();
  }

  // If the path (or any ancestor under root) is a symlink that escapes, reject.
  let probe = candidate;
  while (probe.startsWith(rootWithSep) || probe === rootAbs) {
    try {
      const real = fs.realpathSync.native ? fs.realpathSync.native(probe) : fs.realpathSync(probe);
      const realNorm = path.resolve(real);
      if (realNorm !== rootAbs && !realNorm.startsWith(rootWithSep)) {
        throw new PathEscapeError('Symlink escapes GCH_ROOT');
      }
      // Also ensure final real path of candidate is under root when it exists
      if (probe === candidate) {
        return realNorm;
      }
      break;
    } catch (err) {
      if (err instanceof PathEscapeError) throw err;
      // ENOENT: walk up until something exists
      const parent = path.dirname(probe);
      if (parent === probe) break;
      probe = parent;
      continue;
    }
  }

  // For non-existent paths (create), ensure parent is under root
  if (candidate !== rootAbs && !candidate.startsWith(rootWithSep)) {
    throw new PathEscapeError();
  }
  return candidate;
}

export function toRelativePath(root: string, absolutePath: string): string {
  const rootAbs = normalizeRoot(root);
  const rel = path.relative(rootAbs, absolutePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new PathEscapeError();
  }
  return rel.split(path.sep).join('/');
}
