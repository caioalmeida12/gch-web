import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../../types/activity.js';
import { activityLevel, buildActivityCalendar } from '../activityCalendar.js';

describe('activityLevel', () => {
  it('maps ratios to 0-4', () => {
    expect(activityLevel(0, 10)).toBe(0);
    expect(activityLevel(1, 10)).toBe(1);
    expect(activityLevel(3, 10)).toBe(2);
    expect(activityLevel(6, 10)).toBe(3);
    expect(activityLevel(10, 10)).toBe(4);
  });
});

describe('buildActivityCalendar', () => {
  it('builds a sunday-aligned grid with counts', () => {
    const entries: ActivityEntry[] = [
      {
        timestamp: '2026-11-09T10:00:00.000Z',
        agent: 'Cursor',
        description: 'x',
        tag: 'feature',
        status: 'completed',
        files: [],
        summary: '',
      },
      {
        timestamp: '2026-11-09T11:00:00.000Z',
        agent: 'Cursor',
        description: 'y',
        tag: 'feature',
        status: 'completed',
        files: [],
        summary: '',
      },
    ];

    const model = buildActivityCalendar(entries, {
      weeks: 1,
      now: new Date('2026-11-09T15:00:00.000Z'),
    });

    expect(model.weeks).toHaveLength(1);
    expect(model.weeks[0]).toHaveLength(7);
    expect(model.to).toBe('2026-11-09');
    expect(model.total).toBe(2);
    const day = model.days.find((d) => d.date === '2026-11-09');
    expect(day?.count).toBe(2);
    expect(day?.level).toBe(4);
  });
});
