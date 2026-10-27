export function serializeStructuredData(data: Record<string, unknown>) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
