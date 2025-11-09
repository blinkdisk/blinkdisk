import type { ZSftpConfigType } from "@schemas/providers";
import { execFile } from "child_process";

export function sshKeyscan(form: ZSftpConfigType) {
  return new Promise<{ error?: string; output?: string }>((res) => {
    execFile("ssh-keyscan", (_1, _2, stderr) => {
      if (!stderr.includes("usage:"))
        return res({ error: "KEYSCAN_NOT_INSTALLED" });

      execFile(
        "ssh-keyscan",
        ["-p", form.port.toString(), form.host],
        {
          timeout: 30_000,
          maxBuffer: 200 * 1024,
          env: { PATH: process.env.PATH ?? "" },
        },
        (err, stdout, stderr) => {
          if (err || stderr) return res({ error: "SCAN_FAILED" });
          res({ output: stdout });
        },
      );
    });
  });
}
