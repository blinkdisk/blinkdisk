import { Bandwith } from "@hooks/components/form/bandwith";
import { Checkbox } from "@hooks/components/form/checkbox";
import { Code } from "@hooks/components/form/code";
import { Counter } from "@hooks/components/form/counter";
import { Filesize } from "@hooks/components/form/filesize";
import { Password } from "@hooks/components/form/password";
import { Path } from "@hooks/components/form/path";
import { Select } from "@hooks/components/form/select";
import { Submit } from "@hooks/components/form/submit";
import { Switch } from "@hooks/components/form/switch";
import { Tabs } from "@hooks/components/form/tabs";
import { Text } from "@hooks/components/form/text";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { createContext } from "react";

export const FormDisabledContext = createContext<boolean>(false);

const { fieldContext, formContext, useFormContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Text,
    Password,
    Path,
    Code,
    Select,
    Tabs,
    Switch,
    Counter,
    Filesize,
    Checkbox,
    Bandwith,
  },
  formComponents: {
    Submit,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext, useStore, withForm };
