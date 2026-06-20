import type { ZPolicyLevelType } from "@blinkdisk/schemas/policy";
import { useUpdateFolderPolicy } from "@desktop/hooks/mutations/core/use-update-folder-policy";
import { useUpdateVaultPolicy } from "@desktop/hooks/mutations/core/use-update-vault-policy";
import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { createContext, useCallback, useMemo } from "react";

function usePolicyContext({
  level,
  folderId,
  mock,
  profile,
}: {
  level: ZPolicyLevelType;
  folderId?: string;
  mock?: { path: string };
  profile?: SelectedProfile;
}) {
  const { data: vaultPolicy, isPending: isVaultPolicyPending } = useVaultPolicy(
    { profile },
  );
  const { data: folderPolicy, isPending: isFolderPolicyPending } =
    useFolderPolicy({ folderId, mock, profile });

  const { mutateAsync: mutateVault } = useUpdateVaultPolicy({ profile });

  const { mutateAsync: mutateFolder } = useUpdateFolderPolicy({
    mock,
    folderId,
    profile,
  });

  const policy = useMemo(
    () => (level === "FOLDER" ? folderPolicy : vaultPolicy),
    [folderPolicy, vaultPolicy, level],
  );

  const loading = useMemo(
    () => (level === "FOLDER" ? isFolderPolicyPending : isVaultPolicyPending),
    [level, isFolderPolicyPending, isVaultPolicyPending],
  );

  const definedFields = useMemo(
    () => (level === "FOLDER" ? folderPolicy?.definedFields : undefined),
    [folderPolicy?.definedFields, level],
  );

  const mutate = useMemo(
    () => (level === "FOLDER" ? mutateFolder : mutateVault),
    [mutateFolder, mutateVault, level],
  );

  const onChange = useCallback(
    ({ formApi, fieldApi }: { formApi: AnyFormApi; fieldApi: AnyFieldApi }) => {
      if (level === "VAULT") return;

      // Removes array index from field name
      // e.g. cron[0].expression -> cron
      const fieldName = fieldApi.name.split("[")[0];
      if (fieldName === "definedFields") return;

      const definedFields = formApi.getFieldValue("definedFields") as string[];
      const filtered = definedFields?.filter((field) => field !== fieldName);

      formApi.setFieldValue("definedFields", [...(filtered || []), fieldName]);
    },
    [level],
  );

  return {
    loading,
    vaultPolicy,
    folderPolicy,
    definedFields,
    onChange,
    folderId,
    policy,
    mutate,
    level,
    mock,
    profile,
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
  mock: undefined,
  profile: undefined,
};

export const PolicyContext = createContext<
  PolicyContextType | typeof defaultContext
>(defaultContext);

type PolicyContextProviderProps = {
  level: ZPolicyLevelType;
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
