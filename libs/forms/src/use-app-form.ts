import { Bandwith } from "@forms/components/bandwith";
import { Checkbox } from "@forms/components/checkbox";
import { Code } from "@forms/components/code";
import { Counter } from "@forms/components/counter";
import { Filesize } from "@forms/components/filesize";
import { Password } from "@forms/components/password";
import { Path } from "@forms/components/path";
import { Select } from "@forms/components/select";
import { Submit } from "@forms/components/submit";
import { Switch } from "@forms/components/switch";
import { Tabs } from "@forms/components/tabs";
import { Text } from "@forms/components/text";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { createContext } from "react";

export const FormDisabledContext = createContext<boolean>(false);

const { fieldContext, formContext, useFormContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
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

export { useAppForm, useFieldContext, useFormContext, useStore };
