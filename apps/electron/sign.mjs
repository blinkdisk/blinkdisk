/* eslint-disable no-undef */
/* eslint-disable turbo/no-undeclared-env-vars */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

function getSignToolPath() {
  const programFiles86 =
    process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";

  const kitsRoot = path.join(programFiles86, "Windows Kits", "10", "bin");

  if (!fs.existsSync(kitsRoot)) {
    throw new Error(`Windows Kits directory not found at: ${kitsRoot}`);
  }

  const folders = fs
    .readdirSync(kitsRoot)
    .filter((folder) => folder.startsWith("10."));

  if (folders.length === 0)
    throw new Error(
      "No Windows 10 SDK versions found in Windows Kits directory.",
    );

  const latestVersion = folders.sort().reverse()[0];
  return path.join(kitsRoot, latestVersion, "x64", "signtool.exe");
}

export default async function (configuration) {
  if (process.platform !== "win32") {
    console.info("Skipping signing on platform", process.platform);
    return;
  }

  const sha1 = process.env.CERTUM_CERTIFICATE_SHA1;
  if (!sha1) {
    console.log("Skipping signing because CERTUM_CERTIFICATE_SHA1 is not set");
    return;
  }

  const signTool = getSignToolPath();
  console.log("Found signtool.exe at", signTool);

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
      console.log("Signing of ", configuration.path, " succeeded");
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

  throw new Error("Failed to sign " + configuration.path);
}
