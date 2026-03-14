import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZPolicyType,
  ZSchedulePolicy,
  ZSchedulePolicyType,
} from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/context";
import { pickDefinedFields } from "@desktop/lib/policy";
import { useContext } from "react";

export function usePolicyScheduleForm() {
  const { mutate, policy, definedFields, onChange, level } =
    useContext(PolicyContext);

  const form = useAppForm({
    defaultValues: {
      ...policy?.effective?.schedule,
      trigger: policy?.effective?.schedule?.trigger || "SCHEDULE",
      interval: policy?.effective?.schedule?.interval || "NONE",
      definedFields: definedFields?.schedule,
    } as ZSchedulePolicyType & {
      definedFields?: string[];
    },
    validators: {
      onSubmit: ZSchedulePolicy,
    },
    listeners: {
      onChange,
    },
    onSubmit: async ({ value }) =>
      policy &&
      value &&
      (await mutate(
        {
          ...policy.defined,
          schedule:
            level === "FOLDER"
              ? pickDefinedFields(value, value.definedFields || [])
              : value,
        } satisfies ZPolicyType,
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
