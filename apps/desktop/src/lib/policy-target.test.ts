import {
  buildPolicyTree,
  createDraftPolicyTarget,
  getDraftPolicyUserName,
  getRealPolicyUserName,
  isDraftPolicyUserName,
  parseKopiaPolicyTarget,
  policyTargetFromSearch,
  policyTargetId,
  policyTargetToKopiaParams,
  policyTargetToResolveParams,
  policyTargetToSearch,
} from "@desktop/lib/policy-target";

describe("draft policy user names", () => {
  it("prefixes draft policy users", () => {
    expect(getDraftPolicyUserName("paul")).toBe("BLINKDISK-DRAFT-paul");
  });

  it("detects and strips draft policy prefixes", () => {
    expect(isDraftPolicyUserName("BLINKDISK-DRAFT-paul")).toBe(true);
    expect(getRealPolicyUserName("BLINKDISK-DRAFT-paul")).toBe("paul");
    expect(getRealPolicyUserName("paul")).toBe("paul");
  });
});

describe("policy target params", () => {
  it("maps global targets to no params", () => {
    expect(policyTargetToKopiaParams({ kind: "GLOBAL" })).toBeUndefined();
  });

  it("maps host, user and folder targets to Kopia params", () => {
    expect(
      policyTargetToKopiaParams({ kind: "HOST", hostName: "device" }),
    ).toEqual({ host: "device" });

    expect(
      policyTargetToKopiaParams({
        kind: "USER",
        hostName: "device",
        userName: "paul",
      }),
    ).toEqual({ host: "device", userName: "paul" });

    expect(
      policyTargetToKopiaParams({
        kind: "SOURCE",
        hostName: "device",
        userName: "paul",
        path: "/Users/paul/Documents",
      }),
    ).toEqual({
      host: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    });
  });

  it("uses prefixed users for draft storage but real users for resolution", () => {
    const target = createDraftPolicyTarget({
      hostName: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    });

    expect(policyTargetToKopiaParams(target)).toEqual({
      host: "device",
      userName: "BLINKDISK-DRAFT-paul",
      path: "/Users/paul/Documents",
    });

    expect(policyTargetToResolveParams(target)).toEqual({
      host: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    });
  });
});

describe("policy target parsing", () => {
  it("parses Kopia targets into explicit policy targets", () => {
    expect(parseKopiaPolicyTarget({})).toEqual({ kind: "GLOBAL" });
    expect(parseKopiaPolicyTarget({ host: "device" })).toEqual({
      kind: "HOST",
      hostName: "device",
    });
    expect(
      parseKopiaPolicyTarget({ host: "device", userName: "paul" }),
    ).toEqual({ kind: "USER", hostName: "device", userName: "paul" });
    expect(
      parseKopiaPolicyTarget({
        host: "device",
        userName: "paul",
        path: "/Users/paul/Documents",
      }),
    ).toEqual({
      kind: "SOURCE",
      hostName: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    });
  });

  it("parses draft targets as draft folders under the real user", () => {
    expect(
      parseKopiaPolicyTarget({
        host: "device",
        userName: "BLINKDISK-DRAFT-paul",
        path: "/Users/paul/Documents",
      }),
    ).toEqual({
      kind: "DRAFT_SOURCE",
      hostName: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    });
  });

  it("roundtrips through route search state", () => {
    const target = {
      kind: "SOURCE" as const,
      hostName: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    };

    expect(policyTargetFromSearch(policyTargetToSearch(target))).toEqual(
      target,
    );
  });
});

describe("buildPolicyTree", () => {
  it("builds host, user, folder and nested folder nodes", () => {
    const tree = buildPolicyTree({
      policies: [
        { target: {} },
        { target: { host: "device" } },
        { target: { host: "device", userName: "paul" } },
        {
          target: {
            host: "device",
            userName: "paul",
            path: "/Users/paul/Documents/Invoices",
          },
        },
      ],
      sources: [
        {
          id: "documents",
          name: "Documents",
          source: {
            host: "device",
            userName: "paul",
            path: "/Users/paul/Documents",
          },
        },
      ],
    });

    expect(tree.hasPolicy).toBe(true);

    const host = tree.children[0];
    const user = host?.children[0];
    const folder = user?.children[0];
    const child = folder?.children[0];

    expect(host?.target.kind).toBe("HOST");
    expect(host?.hasPolicy).toBe(true);
    expect(user?.target.kind).toBe("USER");
    expect(user?.hasPolicy).toBe(true);
    expect(folder?.label).toBe("Documents");
    expect(folder?.source?.id).toBe("documents");
    expect(child?.label).toBe("Invoices");
    expect(child?.hasPolicy).toBe(true);
  });

  it("shows draft folder policies under their intended real user", () => {
    const tree = buildPolicyTree({
      policies: [
        {
          target: {
            host: "device",
            userName: "BLINKDISK-DRAFT-paul",
            path: "/Users/paul/Documents",
          },
        },
      ],
      sources: [],
    });

    const host = tree.children[0];
    const user = host?.children[0];
    const draft = user?.children[0];

    expect(user?.label).toBe("paul");
    expect(draft?.target.kind).toBe("DRAFT_SOURCE");
    expect(policyTargetId(draft?.target || { kind: "GLOBAL" })).toBe(
      "DRAFT_SOURCE:device:paul:/Users/paul/Documents",
    );
  });

  it("shows draft folder sources under their intended real user", () => {
    const tree = buildPolicyTree({
      policies: [],
      sources: [
        {
          id: "draft-documents",
          name: "Documents",
          source: {
            host: "device",
            userName: "BLINKDISK-DRAFT-paul",
            path: "/Users/paul/Documents",
          },
        },
      ],
    });

    const host = tree.children[0];
    const user = host?.children[0];
    const draft = user?.children[0];

    expect(user?.label).toBe("paul");
    expect(draft?.target.kind).toBe("DRAFT_SOURCE");
    expect(draft?.source?.source.userName).toBe("paul");
    expect(policyTargetId(draft?.target || { kind: "GLOBAL" })).toBe(
      "DRAFT_SOURCE:device:paul:/Users/paul/Documents",
    );
  });
});
