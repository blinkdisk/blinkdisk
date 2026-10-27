export function contentImageUrl(source: string | undefined, cmsUrl: string) {
  return source?.startsWith("/assets/")
    ? new URL(source, cmsUrl).toString()
    : source;
}
