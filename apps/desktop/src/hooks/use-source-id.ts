import { useParams } from "@tanstack/react-router";

export function useSourceId() {
  const { sourceId } = useParams({ strict: false });
  return { sourceId };
}
