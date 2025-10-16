export type Architecture = "arm64" | "armv7l" | "x86_64";

export function getArchitectureFromCpu(
  architecture: string | undefined,
): Architecture | null {
  if (["arm64", "aarch64", "arm"].includes(architecture || "")) return "arm64";
  if (["armv7l", "armhf"].includes(architecture || "")) return "armv7l";
  return "x86_64";
}
