import { ChildProcessWithoutNullStreams } from "child_process";
import { CookieJar } from "tough-cookie";

export type VaultStatus = "SETUP" | "STARTING" | "RUNNING";

export type VaultServer = {
  process: ChildProcessWithoutNullStreams;
  cookies: CookieJar;
  signingKey: string;
  sessionCookie: string;
  address: string;
  password: string;
  controlPassword: string;
  certificateHash: string;
  certificate: string;
};

export type VaultInstance = {
  id: string;
  status: VaultStatus;
  server: VaultServer;
};
