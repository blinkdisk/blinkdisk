import { useUpdateFolderPolicy } from "@desktop/hooks/mutations/core/use-update-folder-policy";
import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useAppForm } from "@hooks/use-app-form";
import { ZGeneralPolicyForm, ZGeneralPolicyFormType } from "@schemas/policy";

export function usePolicyGeneralForm() {
  const { data: policy } = useFolderPolicy();

  const { mutateAsync: mutate } = useUpdateFolderPolicy(() => form.reset());

  const form = useAppForm({
    defaultValues: {
      name: policy?.name,
      emoji: policy?.emoji,
    } as ZGeneralPolicyFormType,
    validators: {
      onSubmit: ZGeneralPolicyForm,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate({
        ...policy,
        ...value,
      })),
  });

  return form;
}
