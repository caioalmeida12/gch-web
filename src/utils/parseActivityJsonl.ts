import type { ActivityEntry, ActivityFileRef, ActivityStatus } from '../types/activity.js';

const STATUSES = new Set<ActivityStatus>(['started', 'completed', 'interrupted', 'blocked']);

function asStatus(value: unknown): ActivityStatus {
  if (typeof value === 'string' && STATUSES.has(value as ActivityStatus)) {
    return value as ActivityStatus;
  }
  return 'started';
}

function asFiles(value: unknown): ActivityFileRef[] {
  if (!Array.isArray(value)) return [];
  const files: ActivityFileRef[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    if (typeof record.path !== 'string' || !record.path) continue;
    const action: ActivityFileRef['action'] =
      record.action === 'created' ||
      record.action === 'modified' ||
      record.action === 'deleted' ||
      record.action === 'read'
        ? record.action
        : 'read';
    files.push({
      path: record.path,
      action,
      ...(typeof record.reason === 'string' ? { reason: record.reason } : {}),
    });
  }
  return files;
}

export function parseActivityJsonl(raw: string): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (typeof parsed.timestamp !== 'string' || typeof parsed.description !== 'string') {
        continue;
      }
      entries.push({
        timestamp: parsed.timestamp,
        agent: typeof parsed.agent === 'string' ? parsed.agent : 'unknown',
        description: parsed.description,
        tag: typeof parsed.tag === 'string' ? parsed.tag : 'chore',
        status: asStatus(parsed.status),
        ...(typeof parsed.task_ref === 'string' ? { task_ref: parsed.task_ref } : {}),
        files: asFiles(parsed.files),
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      });
    } catch {
      // skip malformed lines
    }
  }
  return entries;
}
