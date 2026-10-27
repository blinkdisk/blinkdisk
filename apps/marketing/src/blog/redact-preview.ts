type EventWithRequest = {
  request?: {
    url?: string;
    query_string?: unknown;
    cookies?: unknown;
    headers?: Record<string, string>;
  };
};
export function redactPreviewRequest<T extends EventWithRequest>(event: T): T {
  if (event.request?.url) {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith("/blog/preview/")) {
      url.searchParams.delete("key");
      event.request.url = url.toString();
      event.request.query_string = undefined;
      event.request.cookies = undefined;
      if (event.request.headers) {
        for (const name of Object.keys(event.request.headers)) {
          if (
            ["cookie", "authorization", "referer"].includes(name.toLowerCase())
          )
            delete event.request.headers[name];
        }
      }
    }
  }
  return event;
}
