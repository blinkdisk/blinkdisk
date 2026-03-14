import { Bandwith } from "#components/bandwith";
import { Checkbox } from "#components/checkbox";
import { Code } from "#components/code";
import { Counter } from "#components/counter";
import { Filesize } from "#components/filesize";
import { Password } from "#components/password";
import { Path } from "#components/path";
import { Select } from "#components/select";
import { Submit } from "#components/submit";
import { Switch } from "#components/switch";
import { Tabs } from "#components/tabs";
import { Text } from "#components/text";
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
