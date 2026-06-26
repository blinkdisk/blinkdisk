import type { VaultDevice } from "@desktop/hooks/queries/core/use-vault-devices";
import {
  getOtherProfiles,
  getProfileUserNames,
  hasMultipleProfileUsers,
  matchesProfileListFilters,
} from "@desktop/lib/profile";
import { describe, expect, it } from "vitest";

const devices: VaultDevice[] = [
  {
    hostName: "local-host",
    users: [{ userName: "paul" }, { userName: "guest" }],
  },
  {
    hostName: "remote-host",
    users: [{ userName: "paul" }, { userName: "guest" }],
  },
];

describe("profile helpers", () => {
  it("excludes only the current host and user pair", () => {
    expect(
      getOtherProfiles(devices, {
        deviceName: "local-host",
        userName: "paul",
      }),
    ).toEqual([
      {
        hostName: "local-host",
        users: [{ userName: "guest" }],
      },
      {
        hostName: "remote-host",
        users: [{ userName: "paul" }, { userName: "guest" }],
      },
    ]);
  });

  it("returns unique user names across all other profiles", () => {
    const otherProfiles = getOtherProfiles(devices, {
      deviceName: "local-host",
      userName: "paul",
    });

    expect(getProfileUserNames(otherProfiles)).toEqual(["guest", "paul"]);
  });

  it("returns user names for one selected host", () => {
    const otherProfiles = getOtherProfiles(devices, {
      deviceName: "local-host",
      userName: "paul",
    });

    expect(getProfileUserNames(otherProfiles, "remote-host")).toEqual([
      "paul",
      "guest",
    ]);
  });

  it("requires multiple users before showing user-specific profile choices", () => {
    expect(
      hasMultipleProfileUsers({
        hostName: "multi-user-host",
        users: [{ userName: "paul" }, { userName: "guest" }],
      }),
    ).toBe(true);
    expect(
      hasMultipleProfileUsers({
        hostName: "single-user-host",
        users: [{ userName: "paul" }],
      }),
    ).toBe(false);
  });

  it("treats empty filter values as all other profiles", () => {
    expect(
      matchesProfileListFilters({
        profile: {
          deviceName: "remote-host",
          userName: "paul",
        },
        filters: {
          deviceName: null,
          userName: null,
        },
      }),
    ).toBe(true);
  });

  it("matches selected device and user filters together", () => {
    expect(
      matchesProfileListFilters({
        profile: {
          deviceName: "remote-host",
          userName: "paul",
        },
        filters: {
          deviceName: "remote-host",
          userName: "paul",
        },
      }),
    ).toBe(true);
  });

  it("matches selected device without requiring a user", () => {
    expect(
      matchesProfileListFilters({
        profile: {
          deviceName: "remote-host",
          userName: "paul",
        },
        filters: {
          deviceName: "remote-host",
          userName: null,
        },
      }),
    ).toBe(true);
  });

  it("matches selected user without requiring a device", () => {
    expect(
      matchesProfileListFilters({
        profile: {
          deviceName: "remote-host",
          userName: "paul",
        },
        filters: {
          deviceName: null,
          userName: "paul",
        },
      }),
    ).toBe(true);
  });
});
