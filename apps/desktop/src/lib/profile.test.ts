import type { VaultProfile } from "@desktop/hooks/queries/core/use-vault-profiles";
import {
  getOtherProfiles,
  getProfileUserNames,
  matchesProfileFilterSelection,
} from "@desktop/lib/profile";
import { describe, expect, it } from "vitest";

const profiles: VaultProfile[] = [
  {
    hostName: "local-host",
    userNames: [{ userName: "paul" }, { userName: "guest" }],
  },
  {
    hostName: "remote-host",
    userNames: [{ userName: "paul" }, { userName: "guest" }],
  },
];

describe("profile helpers", () => {
  it("excludes only the current host and user pair", () => {
    expect(
      getOtherProfiles(profiles, {
        host: "local-host",
        userName: "paul",
      }),
    ).toEqual([
      {
        hostName: "local-host",
        userNames: [{ userName: "guest" }],
      },
      {
        hostName: "remote-host",
        userNames: [{ userName: "paul" }, { userName: "guest" }],
      },
    ]);
  });

  it("returns unique user names across all other profiles", () => {
    const otherProfiles = getOtherProfiles(profiles, {
      host: "local-host",
      userName: "paul",
    });

    expect(getProfileUserNames(otherProfiles)).toEqual(["guest", "paul"]);
  });

  it("returns user names for one selected host", () => {
    const otherProfiles = getOtherProfiles(profiles, {
      host: "local-host",
      userName: "paul",
    });

    expect(getProfileUserNames(otherProfiles, "remote-host")).toEqual([
      "paul",
      "guest",
    ]);
  });

  it("treats empty filter values as all other profiles", () => {
    expect(
      matchesProfileFilterSelection({
        profile: {
          host: "remote-host",
          userName: "paul",
        },
        filters: {
          hostName: null,
          userName: null,
        },
      }),
    ).toBe(true);
  });

  it("matches selected host and user filters", () => {
    expect(
      matchesProfileFilterSelection({
        profile: {
          host: "remote-host",
          userName: "paul",
        },
        filters: {
          hostName: "remote-host",
          userName: "paul",
        },
      }),
    ).toBe(true);
  });
});
