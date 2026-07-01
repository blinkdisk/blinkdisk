import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { Button } from "@blinkdisk/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { ExceedingAlert } from "@desktop/components/dialogs/create-source/exceeding-alert";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { useActivateSourceDraftPolicy } from "@desktop/hooks/mutations/core/use-activate-source-draft-policy";
import { useDeletePolicy } from "@desktop/hooks/mutations/core/use-delete-policy";
import {
  type PolicyTarget,
  policyTargetParent,
} from "@desktop/lib/policy-target";
import {
  type PolicyEditorMode,
  policyEditorHeaderClassName,
} from "@desktop/routes/$accountId/$vaultId/policies/constants";
import {
  ListChecksIcon,
  PlusIcon,
  SaveIcon,
  SlidersHorizontalIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

type PolicyEditorHeaderProps = {
  draftPolicy?: ZPolicyType;
  draftTarget?: Extract<PolicyTarget, { kind: "DRAFT_SOURCE" }>;
  form: PolicyForm;
  mode: PolicyEditorMode;
  onModeChange: (mode: PolicyEditorMode) => void;
  onSelectTarget: (target: PolicyTarget) => void;
};

export function PolicyEditorHeader({
  draftPolicy,
  draftTarget,
  form,
  mode,
  onModeChange,
  onSelectTarget,
}: PolicyEditorHeaderProps) {
  const { t } = useAppTranslation("policy.page");
  const [alertShown, setAlertShown] = useState(false);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const activate = useActivateSourceDraftPolicy({
    target: draftTarget,
    onError: (error) => {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "SOURCE_TOO_LARGE"
      )
        setAlertShown(true);
    },
  });
  const discard = useDeletePolicy({
    target: draftTarget,
    onSuccess: () => {
      if (!draftTarget) return;

      const parent = policyTargetParent(draftTarget);
      if (parent) onSelectTarget(parent);
    },
  });

  return (
    <>
      <div className={policyEditorHeaderClassName}>
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <h1 className="shrink-0 text-2xl font-bold">{t("editor.title")}</h1>
          <div className="flex min-w-fit flex-1 justify-center">
            <Tabs
              value={mode}
              onValueChange={(value) => onModeChange(value as PolicyEditorMode)}
              className="shrink-0"
            >
              <TabsList className="h-10">
                <TabsTrigger value="basic" className="px-4">
                  <ListChecksIcon />
                  {t("editor.mode.basic")}
                </TabsTrigger>
                <TabsTrigger value="advanced" className="px-4">
                  <SlidersHorizontalIcon />
                  {t("editor.mode.advanced")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {draftTarget ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="destructive-secondary"
                aria-label={t("draft.discard.button")}
                title={t("draft.discard.button")}
                onClick={() => discard.mutate()}
                loading={discard.isPending}
              >
                <TrashIcon />
              </Button>
              <Button
                type="submit"
                size="icon"
                variant="secondary"
                aria-label={t("editor.save")}
                title={t("editor.save")}
                disabled={!isDirty || isSubmitting}
                loading={isSubmitting}
              >
                <SaveIcon />
              </Button>
              <Button
                type="button"
                onClick={() =>
                  draftPolicy && activate.mutate({ policy: draftPolicy })
                }
                disabled={!draftPolicy}
                loading={activate.isPending}
              >
                <PlusIcon />
                {t("draft.activate.button")}
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              loading={isSubmitting}
            >
              <SaveIcon />
              {t("editor.save")}
            </Button>
          )}
        </div>
      </div>
      {draftPolicy ? (
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={activate.isPending}
          submit={() => activate.mutate({ policy: draftPolicy, force: true })}
        />
      ) : null}
    </>
  );
}
