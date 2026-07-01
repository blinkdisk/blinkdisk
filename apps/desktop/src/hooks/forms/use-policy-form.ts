import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZPolicy, type ZPolicyType } from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/policy-context";
import { emptyPolicy, pickDefinedFields } from "@desktop/lib/policy";
import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { use } from "react";
import { z } from "zod";

const POLICY_FORM_SECTIONS = [
  "schedule",
  "retention",
  "files",
  "compression",
] as const;

export type PolicyFormSection = (typeof POLICY_FORM_SECTIONS)[number];

export type PolicyDefinedFields = Partial<Record<PolicyFormSection, string[]>>;

export type PolicyFormValues = ZPolicyType & {
  definedFields?: PolicyDefinedFields;
};

const ZPolicyDefinedFields = z.object({
  schedule: z.string().array().optional(),
  retention: z.string().array().optional(),
  files: z.string().array().optional(),
  compression: z.string().array().optional(),
});

const ZPolicyForm = ZPolicy.extend({
  definedFields: ZPolicyDefinedFields.optional(),
});

type PolicyQueryValue = {
  defined: ZPolicyType;
  effective: ZPolicyType;
  definedFields: PolicyDefinedFields;
};

export function usePolicyForm() {
  const { inherited, mutate, policy } = use(PolicyContext);

  const form = useAppForm({
    defaultValues: getPolicyFormDefaultValues(policy),
    validators: {
      onSubmit: ZPolicyForm,
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        if (!inherited) return;
        markPolicyFieldDefined({ formApi, fieldApi });
      },
    },
    onSubmit: async ({ value }) => {
      if (!policy || !mutate) return;

      await mutate(getPolicyFromFormValues(value, policy.defined, inherited), {
        onSuccess: () => form.reset(value),
      });
    },
  });

  return form;
}

export type PolicyForm = ReturnType<typeof usePolicyForm>;

export function getPolicyDefinedFieldPath(fieldName: string):
  | {
      section: PolicyFormSection;
      field: string;
    }
  | undefined {
  if (fieldName.startsWith("definedFields")) return undefined;

  const [section, rest] = fieldName.replace(/\[\d+\]/g, "").split(".");

  if (!isPolicyFormSection(section) || !rest) return undefined;

  const field = rest.split(".")[0];
  if (!field) return undefined;

  return {
    section,
    field,
  };
}

export function setPolicyFieldDefined({
  formApi,
  section,
  field,
  defined,
}: {
  formApi: AnyFormApi;
  section: PolicyFormSection;
  field: string;
  defined: boolean;
}) {
  const definedFields =
    (formApi.getFieldValue("definedFields") as PolicyDefinedFields) || {};
  const sectionFields = definedFields[section] || [];
  const filtered = sectionFields.filter((value) => value !== field);

  formApi.setFieldValue("definedFields", {
    ...definedFields,
    [section]: defined ? [...filtered, field] : filtered,
  });
}

function markPolicyFieldDefined({
  formApi,
  fieldApi,
}: {
  formApi: AnyFormApi;
  fieldApi: AnyFieldApi;
}) {
  const path = getPolicyDefinedFieldPath(fieldApi.name);
  if (!path) return;

  setPolicyFieldDefined({
    formApi,
    section: path.section,
    field: path.field,
    defined: true,
  });
}

function isPolicyFormSection(
  value: string | undefined,
): value is PolicyFormSection {
  return POLICY_FORM_SECTIONS.some((section) => section === value);
}

function getPolicyFormDefaultValues(
  policy: PolicyQueryValue | null | undefined,
): PolicyFormValues {
  const defined = policy?.defined || emptyPolicy;
  const effective = policy?.effective || defined;

  return {
    ...defined,
    name: defined.name,
    emoji: defined.emoji || undefined,
    retention: {
      ...effective.retention,
    },
    files: {
      ...effective.files,
      excludeCacheDirs: effective.files.excludeCacheDirs || false,
    },
    schedule: {
      ...effective.schedule,
      trigger: effective.schedule.trigger || "SCHEDULE",
      interval: effective.schedule.interval || "NONE",
    },
    compression: {
      ...effective.compression,
      algorithm: effective.compression.algorithm || "",
    },
    definedFields: policy?.definedFields,
  };
}

export function getPolicyFromFormValues(
  values: PolicyFormValues,
  definedPolicy: ZPolicyType,
  inherited: boolean,
): ZPolicyType {
  return {
    ...definedPolicy,
    name: values.name,
    emoji: values.emoji,
    retention: inherited
      ? pickDefinedFields(
          values.retention,
          values.definedFields?.retention || [],
        )
      : values.retention,
    files: inherited
      ? pickDefinedFields(values.files, values.definedFields?.files || [])
      : values.files,
    schedule: inherited
      ? pickDefinedFields(values.schedule, values.definedFields?.schedule || [])
      : values.schedule,
    compression: inherited
      ? pickDefinedFields(
          values.compression,
          values.definedFields?.compression || [],
        )
      : values.compression,
  };
}
