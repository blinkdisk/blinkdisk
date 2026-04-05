import { useParams } from "@tanstack/react-router";

export function useAccountId() {
  const { accountId } = useParams({ strict: false });
  return { accountId };
}
