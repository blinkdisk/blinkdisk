import { DynamicField } from "@blinkdisk/components/dynamic-field";
import { COMPRESSION_ALGORITHMS } from "@blinkdisk/constants/algorithms";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Input } from "@blinkdisk/ui/input";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { cn } from "@blinkdisk/utils/class";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import {
  GaugeIcon,
  Minimize2Icon,
  PlusIcon,
  TrashIcon,
  ZapIcon,
} from "lucide-react";
import { use } from "react";

const PRESET_MAP = {
  "s2-default": "faster",
  pgzip: "balanced",
  zstd: "smaller",
} as const;

const ALGORITHM_MAP = {
  faster: "s2-default",
  balanced: "pgzip",
  smaller: "zstd",
} as const;

const PRESET_CARDS = [
  { id: "faster", icon: ZapIcon },
  { id: "balanced", icon: GaugeIcon },
  { id: "smaller", icon: Minimize2Icon },
] as const;

export function CompressionSettings({
  form,
  showExtensionFilters = true,
}: {
  form: PolicyForm;
  showExtensionFilters?: boolean;
}) {
  const { t } = useAppTranslation("policy.compression");

  const algorithm = useStore(
    form.store,
    (state) => state.values.compression.algorithm,
  );
  const isDisabled = !algorithm || algorithm === "none";

  return (
    <SettingsCategory
      id="compression"
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        <form.AppField name="compression.algorithm">
          {() => (
            <PolicyField>
              <AlgorithmSelector />
            </PolicyField>
          )}
        </form.AppField>
        {!isDisabled && (
          <>
            <form.AppField name="compression.minFileSize">
              {(field) => (
                <PolicyField>
                  <field.Filesize
                    label={{
                      title: t("minFileSize.label"),
                      description: t("minFileSize.description"),
                    }}
                  />
                </PolicyField>
              )}
            </form.AppField>
            <form.AppField name="compression.maxFileSize">
              {(field) => (
                <PolicyField>
                  <field.Filesize
                    label={{
                      title: t("maxFileSize.label"),
                      description: t("maxFileSize.description"),
                    }}
                  />
                </PolicyField>
              )}
            </form.AppField>
            {showExtensionFilters ? (
              <>
                <form.AppField name="compression.extensionAllowlist">
                  {() => (
                    <PolicyField>
                      <ExtensionListEditor
                        form={form}
                        fieldName="compression.extensionAllowlist"
                        label={t("extensionAllowlist.label")}
                        description={t("extensionAllowlist.description")}
                        addLabel={t("extensionAllowlist.add")}
                        placeholder={t("extensionAllowlist.placeholder")}
                      />
                    </PolicyField>
                  )}
                </form.AppField>
                <form.AppField name="compression.extensionDenylist">
                  {() => (
                    <PolicyField>
                      <ExtensionListEditor
                        form={form}
                        fieldName="compression.extensionDenylist"
                        label={t("extensionDenylist.label")}
                        description={t("extensionDenylist.description")}
                        addLabel={t("extensionDenylist.add")}
                        placeholder={t("extensionDenylist.placeholder")}
                      />
                    </PolicyField>
                  )}
                </form.AppField>
              </>
            ) : null}
          </>
        )}
      </div>
    </SettingsCategory>
  );
}

type TabId = "off" | "recommended" | "other";

function getTabFromAlgorithm(algorithm: string): TabId {
  if (!algorithm || algorithm === "none") return "off";
  if (algorithm in PRESET_MAP) return "recommended";
  return "other";
}

function AlgorithmSelector() {
  const { t } = useAppTranslation("policy.compression");
  const field = useFieldContext<string>();
  const disabledContext = use(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  const activeTab = getTabFromAlgorithm(value);

  const activePreset = PRESET_MAP[value as keyof typeof PRESET_MAP] ?? null;

  const algorithms = COMPRESSION_ALGORITHMS.map((alg) => ({
    value: alg,
    label: t(`algorithm.items.${alg}`),
  }));

  return (
    <DynamicField
      title={t("algorithm.label")}
      description={t("algorithm.description")}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <Tabs
        className="flex flex-col"
        value={activeTab}
        onValueChange={(tab) => {
          const tabId = tab as TabId;

          if (tabId === "off") {
            field.setValue("none");
          } else if (tabId === "recommended") {
            field.setValue(ALGORITHM_MAP.balanced);
          } else if (tabId === "other") {
            field.setValue("pgzip-best-speed");
          }
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="off" disabled={disabledContext}>
            {t("algorithm.tabs.off")}
          </TabsTrigger>
          <TabsTrigger value="recommended" disabled={disabledContext}>
            {t("algorithm.tabs.recommended")}
          </TabsTrigger>
          <TabsTrigger value="other" disabled={disabledContext}>
            {t("algorithm.tabs.other")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommended">
          <div className="grid grid-cols-3 gap-2">
            {PRESET_CARDS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={disabledContext}
                onClick={() => {
                  field.setValue(ALGORITHM_MAP[preset.id]);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors",
                  activePreset === preset.id
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50",
                  disabledContext && "cursor-not-allowed opacity-50",
                )}
              >
                <preset.icon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t(`algorithm.presets.${preset.id}`)}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="other">
          <SelectRoot
            onValueChange={(val) => val && field.setValue(val)}
            value={value}
            disabled={disabledContext}
            items={algorithms}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("algorithm.placeholder")} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {algorithms.map((alg) => (
                <SelectItem key={alg.value} value={alg.value}>
                  {alg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </TabsContent>
      </Tabs>
    </DynamicField>
  );
}

type ExtensionListEditorProps = {
  form: PolicyForm;
  fieldName: "compression.extensionAllowlist" | "compression.extensionDenylist";
  label: string;
  description: string;
  addLabel: string;
  placeholder: string;
};

function ExtensionListEditor({
  form,
  fieldName,
  label,
  description,
  addLabel,
  placeholder,
}: ExtensionListEditorProps) {
  const field = useFieldContext<string[] | undefined>();
  const disabledContext = use(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  return (
    <DynamicField title={label} description={description}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((extension, index) => (
            <form.Field key={extension} name={`${fieldName}[${index}]`}>
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabledContext}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    size="icon"
                    className="shrink-0"
                    disabled={disabledContext}
                    onClick={() => {
                      field.removeValue(index);
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              )}
            </form.Field>
          ))}
        </div>
      ) : null}
      <Button
        variant="secondary"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          field.pushValue("");
        }}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </DynamicField>
  );
}
