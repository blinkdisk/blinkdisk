import { z } from "zod";

export const ZEmail = z.string().email();
