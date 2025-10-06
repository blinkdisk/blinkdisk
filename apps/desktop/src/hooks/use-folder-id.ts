import { useParams } from "@tanstack/react-router";

export function useFolderId() {
  const { folderId } = useParams({ strict: false });
  return { folderId };
}
