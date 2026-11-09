export type NodeEntryType = 'file' | 'directory';

export interface NodeListEntry {
  name: string;
  path: string;
  type: NodeEntryType;
  size: number | null;
}

export interface NodeReadResult {
  path: string;
  content: string;
  brief: string;
  hasDetails: boolean;
  detailsIncluded: boolean;
}
