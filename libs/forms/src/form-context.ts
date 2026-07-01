import { createFormHookContexts, useStore } from "@tanstack/react-form";
import { createContext } from "react";

export const FormDisabledContext = createContext<boolean>(false);

export const { fieldContext, formContext, useFormContext, useFieldContext } =
  createFormHookContexts();

export { useStore };
