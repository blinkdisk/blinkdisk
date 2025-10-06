import { filesize, FilesizeOptions } from "filesize";

export function formatSize(size: number, options?: FilesizeOptions) {
  return filesize(size, options);
}

export function formatInt(number: number) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
