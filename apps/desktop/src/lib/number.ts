import { type FilesizeOptions, filesize } from "filesize";

export function formatSize(size: number, options?: FilesizeOptions) {
  return filesize(size, options);
}

export function formatInt(number: number) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatCompactInt(number: number) {
  return number.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    notation: "compact",
  });
}
