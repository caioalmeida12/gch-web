export type ActivityStatus = 'started' | 'completed' | 'interrupted' | 'blocked';

export interface ActivityFileRef {
  path: string;
  action: 'created' | 'modified' | 'deleted' | 'read';
  reason?: string;
}

export interface ActivityEntry {
  timestamp: string;
  agent: string;
  description: string;
  tag: string;
  status: ActivityStatus;
  task_ref?: string;
  files: ActivityFileRef[];
  summary: string;
}

export interface ActivityFilters {
  days?: number;
  tag?: string;
  status?: string;
  agent?: string;
  q?: string;
}

export interface OpenTaskRef {
  task_ref: string;
  description: string;
  agent: string;
  tag: string;
  timestamp: string;
}

export interface ActivityStats {
  total: number;
  todayTotal: number;
  byStatus: Partial<Record<ActivityStatus, number>>;
  byTag: Record<string, number>;
  byAgent: Record<string, number>;
  openTaskRefs: OpenTaskRef[];
}

export interface ActivityCalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
}

export interface ActivityCalendarModel {
  days: ActivityCalendarDay[];
  weeks: ActivityCalendarDay[][];
  total: number;
  activeDays: number;
  from: string;
  to: string;
}
