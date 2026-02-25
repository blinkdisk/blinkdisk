import { compressionAlgorithms } from "@config/algorithms";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import { usePolicyCompressionForm } from "@desktop/hooks/forms/use-policy-compression-form";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { LabelContainer } from "@ui/label";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { cn } from "@utils/class";
import {
  GaugeIcon,
  Minimize2Icon,
  PackageIcon,
  PlusIcon,
  TrashIcon,
  ZapIcon,
} from "lucide-react";
import { useContext, useMemo } from "react";

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

export function CompressionSettings() {
  const { t } = useAppTranslation("policy.compression");

  const form = usePolicyCompressionForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const algorithm = useStore(form.store, (state) => state.values.algorithm);
  const isDisabled = !algorithm || algorithm === "none";

  return (
    <SettingsCategory
      id="compression"
      title={t("title")}
      description={t("description")}
      icon={<PackageIcon />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="algorithm">
          {() => (
            <PolicyField>
              <AlgorithmSelector />
            </PolicyField>
          )}
        </form.AppField>
        {!isDisabled && (
          <>
            <form.AppField name="minFileSize">
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
            <form.AppField name="maxFileSize">
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
            <form.AppField name="extensionAllowlist">
              {() => (
                <PolicyField>
                  <ExtensionListEditor
                    form={form}
                    fieldName="extensionAllowlist"
                    label={t("extensionAllowlist.label")}
                    description={t("extensionAllowlist.description")}
                    addLabel={t("extensionAllowlist.add")}
                    placeholder={t("extensionAllowlist.placeholder")}
                  />
                </PolicyField>
              )}
            </form.AppField>
            <form.AppField name="extensionDenylist">
              {() => (
                <PolicyField>
                  <ExtensionListEditor
                    form={form}
                    fieldName="extensionDenylist"
                    label={t("extensionDenylist.label")}
                    description={t("extensionDenylist.description")}
                    addLabel={t("extensionDenylist.add")}
                    placeholder={t("extensionDenylist.placeholder")}
                  />
                </PolicyField>
              )}
            </form.AppField>
          </>
        )}
        <form.AppForm>
          <form.Submit className="mt-2" disabled={!isDirty}>
            {t("save")}
          </form.Submit>
        </form.AppForm>
      </form>
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
  const disabledContext = useContext(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  const activeTab = useMemo(() => getTabFromAlgorithm(value), [value]);

  const activePreset =
    PRESET_MAP[value as keyof typeof PRESET_MAP] ?? null;

  return (
    <LabelContainer
      title={t("algorithm.label")}
      description={t("algorithm.description")}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <Tabs
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
            onValueChange={(val) => field.setValue(val)}
            value={value}
            disabled={disabledContext}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("algorithm.placeholder")} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {compressionAlgorithms.map((alg) => (
                <SelectItem key={alg} value={alg}>
                  {t(`algorithm.items.${alg}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </TabsContent>
      </Tabs>
    </LabelContainer>
  );
}

type ExtensionListEditorProps = {
  form: ReturnType<typeof usePolicyCompressionForm>;
  fieldName: "extensionAllowlist" | "extensionDenylist";
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
  const disabledContext = useContext(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  return (
    <LabelContainer title={label} description={description}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((_, index) => (
            <form.Field key={index} name={`${fieldName}[${index}]`}>
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabledContext}
                  />
                  <Button
                    variant="outline"
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
        variant="outline"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          field.pushValue("");
        }}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </LabelContainer>
  );
}
