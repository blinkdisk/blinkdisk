export function contentImageUrl(source: string, cmsUrl: string) {
  return source.startsWith("/assets/")
    ? new URL(source, cmsUrl).toString()
    : source;
}
