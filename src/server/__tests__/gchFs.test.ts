import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { deleteNode, listNodes, readNode, writeNode } from '../gchFs.js';

const tmpDirs: string[] = [];

function makeRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gch-fs-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('gchFs CRUD', () => {
  it('lists, writes, reads brief/details, deletes', () => {
    const root = makeRoot();
    fs.mkdirSync(path.join(root, 'g4'), { recursive: true });

    writeNode(root, 'g4/hello.md', 'Brief\n\n---\n\nDetails body');
    const listed = listNodes(root, 'g4');
    expect(listed.map((e) => e.name)).toContain('hello.md');

    const brief = readNode(root, 'g4/hello.md', false);
    expect(brief.content).toBe('Brief');
    expect(brief.hasDetails).toBe(true);

    const full = readNode(root, 'g4/hello.md', true);
    expect(full.content).toContain('Details body');

    const deleted = deleteNode(root, 'g4/hello.md');
    expect(deleted.deleted).toBe(true);
    expect(fs.existsSync(path.join(root, 'g4', 'hello.md'))).toBe(false);
  });

  it('refuses directory delete', () => {
    const root = makeRoot();
    fs.mkdirSync(path.join(root, 'g4'), { recursive: true });
    expect(() => deleteNode(root, 'g4')).toThrow(/directory/i);
  });
});
