import { ZFileSizeType } from "@schemas/policy";

export function fromBytes(bytes: number): ZFileSizeType {
  if (bytes === undefined) return { value: undefined, unit: "B" };

  let unit: ZFileSizeType["unit"] = "B";
  let value = bytes;

  if (bytes >= 1000 * 1000 * 1000 * 1000) {
    value = bytes / (1000 * 1000 * 1000 * 1000);
    unit = "TB";
  } else if (bytes >= 1000 * 1000 * 1000) {
    value = bytes / (1000 * 1000 * 1000);
    unit = "GB";
  } else if (bytes >= 1000 * 1000) {
    value = bytes / (1000 * 1000);
    unit = "MB";
  } else if (bytes >= 1000) {
    value = bytes / 1000;
    unit = "KB";
  }

  return {
    value,
    unit,
  };
}

export function toBytes(size: ZFileSizeType): number | undefined {
  if (size.value == undefined) return undefined;
  if (size.unit === "B") return size.value;
  if (size.unit === "KB") return size.value * 1000;
  if (size.unit === "MB") return size.value * 1000 * 1000;
  if (size.unit === "GB") return size.value * 1000 * 1000 * 1000;
  return size.value * 1000 * 1000 * 1000 * 1000;
}
