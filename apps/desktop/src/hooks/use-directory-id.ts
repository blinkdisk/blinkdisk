import { useParams } from "@tanstack/react-router";

export function useDirectoryId() {
  const { directoryId } = useParams({ strict: false });
  return { directoryId };
}
