const SEPARATOR = /\n---\n/;

export function splitContextBrief(content: string): {
  brief: string;
  hasDetails: boolean;
  details: string;
} {
  const match = content.match(SEPARATOR);
  if (!match || match.index === undefined) {
    return { brief: content, hasDetails: false, details: content };
  }
  const brief = content.slice(0, match.index).trimEnd();
  const details = content;
  return { brief, hasDetails: true, details };
}

export function selectNodeContent(content: string, includeDetails: boolean): {
  content: string;
  brief: string;
  hasDetails: boolean;
  detailsIncluded: boolean;
} {
  const { brief, hasDetails, details } = splitContextBrief(content);
  if (!includeDetails && hasDetails) {
    return {
      content: brief,
      brief,
      hasDetails: true,
      detailsIncluded: false,
    };
  }
  return {
    content: details,
    brief,
    hasDetails,
    detailsIncluded: includeDetails || !hasDetails,
  };
}
