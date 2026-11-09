import { describe, expect, it } from 'vitest';
import { selectNodeContent, splitContextBrief } from '../contextBrief.js';

describe('splitContextBrief', () => {
  it('splits on --- separator', () => {
    const raw = 'Brief line\n\n---\n\nDetails here';
    const result = splitContextBrief(raw);
    expect(result.brief).toBe('Brief line');
    expect(result.hasDetails).toBe(true);
  });

  it('treats whole file as brief when no separator', () => {
    const raw = 'Only brief';
    expect(splitContextBrief(raw)).toEqual({
      brief: 'Only brief',
      hasDetails: false,
      details: 'Only brief',
    });
  });
});

describe('selectNodeContent', () => {
  it('returns brief by default when details exist', () => {
    const raw = 'Brief\n\n---\n\nBody';
    const result = selectNodeContent(raw, false);
    expect(result.content).toBe('Brief');
    expect(result.detailsIncluded).toBe(false);
    expect(result.hasDetails).toBe(true);
  });

  it('returns full content when details requested', () => {
    const raw = 'Brief\n\n---\n\nBody';
    const result = selectNodeContent(raw, true);
    expect(result.content).toBe(raw);
    expect(result.detailsIncluded).toBe(true);
  });
});
