import { describe, expect, it } from 'vitest';
import { parseActivityJsonl } from '../parseActivityJsonl.js';

describe('parseActivityJsonl', () => {
  it('parses valid lines and skips blanks/malformed', () => {
    const raw = [
      '',
      '{"timestamp":"2026-11-09T12:00:00.000Z","agent":"Cursor","description":"A","tag":"feature","status":"started","task_ref":"t1","files":[],"summary":""}',
      'not-json',
      '{"timestamp":"2026-11-09T13:00:00.000Z","agent":"Cursor","description":"B","tag":"bugfix","status":"completed","files":[{"path":"a.ts","action":"modified","reason":"fix"}],"summary":"done"}',
    ].join('\n');

    const entries = parseActivityJsonl(raw);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.task_ref).toBe('t1');
    expect(entries[1]?.files).toEqual([
      { path: 'a.ts', action: 'modified', reason: 'fix' },
    ]);
  });
});
