import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useSourceId } from "@desktop/hooks/use-source-id";

export function useSource(
  sourceId?: string,
  options: { profile?: SelectedProfile } = {},
) {
  const { data: sources } = useSourceList(
    options.profile === undefined ? undefined : { profile: options.profile },
  );
  const { sourceId: defaultSourceId } = useSourceId();

  const source = sources?.find(
    (source) => source.id === (sourceId || defaultSourceId),
  );

  return { data: source };
}
