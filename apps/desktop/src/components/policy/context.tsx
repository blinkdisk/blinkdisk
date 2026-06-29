import type { ZPolicyLevelType } from "@blinkdisk/schemas/policy";
import { useUpdatePolicy } from "@desktop/hooks/mutations/core/use-update-policy";
import { usePolicy } from "@desktop/hooks/queries/core/use-policy";
import { useSource } from "@desktop/hooks/use-source";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import {
  createDraftPolicyTarget,
  type PolicyTarget,
} from "@desktop/lib/policy-target";
import { createContext, useMemo } from "react";

function usePolicyContext({
  target: targetOverride,
  level,
  sourceId,
  mock,
  profile,
}: {
  target?: PolicyTarget;
  level?: ZPolicyLevelType;
  sourceId?: string;
  mock?: { path: string };
  profile?: SelectedProfile;
}) {
  const { data: folder } = useSource(sourceId, { profile });

  const target = useMemo<PolicyTarget | null>(() => {
    if (targetOverride) return targetOverride;

    if (level === "VAULT") {
      if (!profile) return { kind: "GLOBAL" };
      return {
        kind: "USER",
        hostName: profile.deviceName,
        userName: profile.userName,
      };
    }

    if (level === "SOURCE" && mock && profile) {
      return createDraftPolicyTarget({
        hostName: profile.deviceName,
        userName: profile.userName,
        path: mock.path,
      });
    }

    if (level === "SOURCE" && folder) {
      return {
        kind: "SOURCE",
        hostName: folder.source.host,
        userName: folder.source.userName,
        path: folder.source.path,
      };
    }

    return null;
  }, [folder, level, mock, profile, targetOverride]);

  const { data: policy, isPending } = usePolicy(target);

  const { mutateAsync: mutate } = useUpdatePolicy({ target });

  const inherited = useMemo(
    () => !!target && target.kind !== "GLOBAL",
    [target],
  );

  const definedFields = inherited ? policy?.definedFields : undefined;

  return {
    loading: isPending,
    vaultPolicy: target?.kind === "GLOBAL" ? policy : undefined,
    folderPolicy:
      target?.kind === "SOURCE" || target?.kind === "DRAFT_SOURCE"
        ? policy
        : undefined,
    definedFields,
    sourceId,
    policy,
    mutate,
    level: inherited ? "SOURCE" : "VAULT",
    inherited,
    mock,
    profile,
    target,
  };
}

export type PolicyContextType = ReturnType<typeof usePolicyContext>;

const defaultContext = {
  loading: true,
  vaultPolicy: undefined,
  folderPolicy: undefined,
  definedFields: undefined,
  sourceId: undefined,
  policy: undefined,
  mutate: undefined,
  level: undefined,
  inherited: false,
  mock: undefined,
  profile: undefined,
  target: undefined,
};

export const PolicyContext = createContext<
  PolicyContextType | typeof defaultContext
>(defaultContext);

type PolicyContextProviderProps = {
  target?: PolicyTarget;
  level?: ZPolicyLevelType;
  sourceId?: string;
  mock?: { path: string };
  profile?: SelectedProfile;
};

export function PolicyContextProvider({
  children,
  ...props
}: PolicyContextProviderProps & {
  children: (context: PolicyContextType) => React.ReactNode;
}) {
  const context = usePolicyContext(props);

  return (
    <PolicyContext.Provider value={context}>
      {children(context)}
    </PolicyContext.Provider>
  );
}
