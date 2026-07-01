import type { PolicyContextType } from "@desktop/components/policy/context";
import { createContext } from "react";

const defaultContext = {
  loading: true,
  vaultPolicy: undefined,
  sourcePolicy: undefined,
  definedFields: undefined,
  sourceId: undefined,
  policy: undefined,
  mutate: undefined,
  level: undefined,
  inherited: false,
  mock: undefined,
  profile: undefined,
  target: undefined,
};

export const PolicyContext = createContext<
  PolicyContextType | typeof defaultContext
>(defaultContext);
