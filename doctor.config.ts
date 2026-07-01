import { defineConfig } from "react-doctor/api";

export default defineConfig({
  verbose: true,
  noScore: true,
  blocking: "warning",
  projects: [
    "@blinkdisk/desktop",
    "@blinkdisk/marketing",
    "@blinkdisk/web",
    "@blinkdisk/components",
    "@blinkdisk/emails",
    "@blinkdisk/forms",
    "@blinkdisk/hooks",
  ],
  scope: "full",
  ignore: {
    files: ["libs/ui/**"],
  },
  rules: {
    "react-doctor/no-long-transition-duration": "off",
  },
});
