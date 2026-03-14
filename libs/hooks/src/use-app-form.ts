import { Bandwith } from "#components/form/bandwith";
import { Checkbox } from "#components/form/checkbox";
import { Code } from "#components/form/code";
import { Counter } from "#components/form/counter";
import { Filesize } from "#components/form/filesize";
import { Password } from "#components/form/password";
import { Path } from "#components/form/path";
import { Select } from "#components/form/select";
import { Submit } from "#components/form/submit";
import { Switch } from "#components/form/switch";
import { Tabs } from "#components/form/tabs";
import { Text } from "#components/form/text";
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
