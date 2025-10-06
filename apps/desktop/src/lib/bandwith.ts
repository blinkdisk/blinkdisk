import { ZBandwithType } from "@schemas/vault";

export function fromBits(bytes: number): ZBandwithType {
  if (bytes === undefined) return { value: undefined, unit: "bps" };

  let unit: ZBandwithType["unit"] = "bps";
  let value = bytes;

  if (bytes >= 1000 * 1000 * 1000) {
    value = bytes / (1000 * 1000 * 1000);
    unit = "Gbps";
  } else if (bytes >= 1000 * 1000) {
    value = bytes / (1000 * 1000);
    unit = "Mbps";
  } else if (bytes >= 1000) {
    value = bytes / 1000;
    unit = "Kbps";
  }

  return {
    value,
    unit,
  };
}

export function toBits(size: ZBandwithType): number | undefined {
  if (size.value == undefined) return undefined;
  if (size.unit === "bps") return size.value;
  if (size.unit === "Kbps") return size.value * 1000;
  if (size.unit === "Mbps") return size.value * 1000 * 1000;
  return size.value * 1000 * 1000 * 1000;
}
