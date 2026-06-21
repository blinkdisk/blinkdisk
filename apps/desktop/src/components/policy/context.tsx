import type { ZPolicyLevelType } from "@blinkdisk/schemas/policy";
import { useUpdatePolicy } from "@desktop/hooks/mutations/core/use-update-policy";
import { usePolicy } from "@desktop/hooks/queries/core/use-policy";
import { useFolder } from "@desktop/hooks/use-folder";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import {
  createDraftPolicyTarget,
  type PolicyTarget,
} from "@desktop/lib/policy-target";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { createContext, useCallback, useMemo } from "react";

function usePolicyContext({
  target: targetOverride,
  level,
  folderId,
  mock,
  profile,
}: {
  target?: PolicyTarget;
  level?: ZPolicyLevelType;
  folderId?: string;
  mock?: { path: string };
  profile?: SelectedProfile;
}) {
  const { data: folder } = useFolder(folderId, { profile });

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

    if (level === "FOLDER" && mock && profile) {
      return createDraftPolicyTarget({
        hostName: profile.deviceName,
        userName: profile.userName,
        path: mock.path,
      });
    }

    if (level === "FOLDER" && folder) {
      return {
        kind: "FOLDER",
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

  const onChange = useCallback(
    ({ formApi, fieldApi }: { formApi: AnyFormApi; fieldApi: AnyFieldApi }) => {
      if (!inherited) return;

      // Removes array index from field name
      // e.g. cron[0].expression -> cron
      const fieldName = fieldApi.name.split("[")[0];
      if (fieldName === "definedFields") return;

      const definedFields = formApi.getFieldValue("definedFields") as string[];
      const filtered = definedFields?.filter((field) => field !== fieldName);

      formApi.setFieldValue("definedFields", [...(filtered || []), fieldName]);
    },
    [inherited],
  );

  return {
    loading: isPending,
    vaultPolicy: target?.kind === "GLOBAL" ? policy : undefined,
    folderPolicy:
      target?.kind === "FOLDER" || target?.kind === "DRAFT_FOLDER"
        ? policy
        : undefined,
    definedFields,
    onChange,
    folderId,
    policy,
    mutate,
    level: inherited ? "FOLDER" : "VAULT",
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
  onChange: undefined,
  folderId: undefined,
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
  folderId?: string;
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
