import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../../types/activity.js';
import { buildActivityStats, filterActivityEntries } from '../activityStats.js';

const sample: ActivityEntry[] = [
  {
    timestamp: '2026-11-09T10:00:00.000Z',
    agent: 'Cursor',
    description: 'Start A',
    tag: 'feature',
    status: 'started',
    task_ref: 'ref-a',
    files: [],
    summary: '',
  },
  {
    timestamp: '2026-11-09T11:00:00.000Z',
    agent: 'Cursor',
    description: 'Done A',
    tag: 'feature',
    status: 'completed',
    task_ref: 'ref-a',
    files: [],
    summary: 'finished',
  },
  {
    timestamp: '2026-11-08T12:00:00.000Z',
    agent: 'Claude',
    description: 'Open B',
    tag: 'bugfix',
    status: 'started',
    task_ref: 'ref-b',
    files: [],
    summary: '',
  },
  {
    timestamp: '2026-11-01T12:00:00.000Z',
    agent: 'Cursor',
    description: 'Old',
    tag: 'chore',
    status: 'completed',
    files: [],
    summary: '',
  },
];

describe('filterActivityEntries', () => {
  it('filters by days/tag/status/agent/q', () => {
    const now = new Date('2026-11-09T15:00:00.000Z');
    const filtered = filterActivityEntries(
      sample,
      { days: 2, tag: 'bugfix', status: 'started', agent: 'Claude', q: 'open' },
      now,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.task_ref).toBe('ref-b');
  });
});

describe('buildActivityStats', () => {
  it('counts buckets and open task refs (latest still started)', () => {
    const stats = buildActivityStats(sample, '2026-11-09');
    expect(stats.total).toBe(4);
    expect(stats.todayTotal).toBe(2);
    expect(stats.byStatus.completed).toBe(2);
    expect(stats.byTag.feature).toBe(2);
    expect(stats.openTaskRefs.map((r) => r.task_ref)).toEqual(['ref-b']);
  });
});
