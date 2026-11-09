import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { PathEscapeError, resolveSafePath, toRelativePath } from '../pathSandbox.js';

const tmpDirs: string[] = [];

function makeRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gch-sandbox-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('resolveSafePath', () => {
  it('resolves nested paths under root', () => {
    const root = makeRoot();
    fs.mkdirSync(path.join(root, 'g4', 'concepts'), { recursive: true });
    const abs = resolveSafePath(root, 'g4/concepts');
    expect(abs).toBe(path.join(root, 'g4', 'concepts'));
  });

  it('rejects .. escape', () => {
    const root = makeRoot();
    expect(() => resolveSafePath(root, '../outside')).toThrow(PathEscapeError);
  });

  it('rejects symlink that escapes root', () => {
    const root = makeRoot();
    const outside = makeRoot();
    const link = path.join(root, 'escape');
    fs.symlinkSync(outside, link);
    expect(() => resolveSafePath(root, 'escape')).toThrow(PathEscapeError);
  });
});

describe('toRelativePath', () => {
  it('returns posix-style relative path', () => {
    const root = makeRoot();
    const abs = path.join(root, 'g4', 'INDEX.md');
    expect(toRelativePath(root, abs)).toBe('g4/INDEX.md');
  });
});
