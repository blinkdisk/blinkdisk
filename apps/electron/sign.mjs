/* eslint-disable no-undef */
/* eslint-disable turbo/no-undeclared-env-vars */

import { spawnSync } from "child_process";

export default async function (configuration) {
  if (process.platform !== "win32") {
    console.info("Skipping signing on platform", process.platform);
    return;
  }

  const sha1 = process.env.CERTUM_CERTIFICATE_SHA1;
  if (!sha1)
    throw Exception(
      "Failed to sign" +
        configuration.path +
        " because CERTUM_CERTIFICATE_SHA1 is not set",
    );

  const signTool = process.env.WINDOWS_SIGN_TOOL || "signtool.exe";

  const signToolArgs = [
    "sign",
    "/sha1",
    sha1,
    "/fd",
    configuration.hash,
    "/tr",
    process.env.CERTUM_TIMESTAMP_SERVER,
  ];

  if (configuration.isNest) {
    signToolArgs.push("/as");
  }

  signToolArgs.push("/v");
  signToolArgs.push(configuration.path);

  let nextSleepTime = 1000;

  for (let attempt = 0; attempt < 10; attempt++) {
    console.log("Signing ", configuration.path, "attempt", attempt);

    if (attempt > 0) {
      console.log("Sleeping for ", nextSleepTime);
      await new Promise((r) => setTimeout(r, nextSleepTime));
    }

    nextSleepTime *= 2;

    const result = spawnSync(signTool, signToolArgs, {
      stdio: "inherit",
    });

    if (!result.error && 0 === result.status) {
      console.log("Signing of", configuration.path, " succeeded");
      return;
    } else {
      console.log(
        "Signing of" +
          configuration.path +
          " failed with " +
          JSON.stringify(result),
      );
    }
  }

  throw Exception("Failed to sign " + configuration.path);
}
