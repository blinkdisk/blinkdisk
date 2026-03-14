import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZGeneralPolicyForm,
  ZGeneralPolicyFormType,
} from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/context";
import { useContext } from "react";

export function usePolicyGeneralForm() {
  const { mutate, policy } = useContext(PolicyContext);

  const form = useAppForm({
    defaultValues: {
      name: policy?.defined.name,
      emoji: policy?.defined.emoji || "📁",
    } as ZGeneralPolicyFormType,
    validators: {
      onSubmit: ZGeneralPolicyForm,
    },
    onSubmit: async ({ value }) => {
      if (!policy) return;
      await mutate(
        {
          ...policy.defined,
          ...value,
        },
        {
          onSuccess: () => form.reset(),
        },
      );
    },
  });

  return form;
}
