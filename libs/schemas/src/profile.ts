import { z } from "zod";

export const ZCreateProfile = z.object({
  hostName: z.string(),
  machineId: z.string(),
  userName: z.string(),
});

export type ZCreateProfileType = z.infer<typeof ZCreateProfile>;

export const ZListProfiles = z.object({
  deviceId: z.string().optional(),
});

export type ZListProfilesType = z.infer<typeof ZListProfiles>;
