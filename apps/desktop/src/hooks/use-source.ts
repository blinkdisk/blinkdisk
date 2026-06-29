import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useSourceId } from "@desktop/hooks/use-source-id";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useMemo } from "react";

export function useSource(
  sourceId?: string,
  options: { profile?: SelectedProfile } = {},
) {
  const { data: sources } = useSourceList(
    options.profile === undefined ? undefined : { profile: options.profile },
  );
  const { sourceId: defaultSourceId } = useSourceId();

  const source = useMemo(() => {
    return sources?.find(
      (source) => source.id === (sourceId || defaultSourceId),
    );
  }, [sources, sourceId, defaultSourceId]);

  return { data: source };
}
