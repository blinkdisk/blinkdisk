import {
  convertPolicyFromCore,
  convertPolicyToCore,
  CorePolicy,
  defaultVaultPolicy,
  emptyPolicy,
  getDefinedFields,
  pickDefinedFields,
} from "./policy";

describe("pickDefinedFields", () => {
  it("picks only the listed keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pickDefinedFields(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("includes keys with undefined values if listed", () => {
    const obj = { a: 1, b: undefined };
    expect(pickDefinedFields(obj, ["a", "b"])).toEqual({ a: 1, b: undefined });
  });

  it("returns empty object for empty field list", () => {
    expect(pickDefinedFields({ a: 1 }, [])).toEqual({});
  });
});

describe("getDefinedFields", () => {
  it("returns keys that are not undefined", () => {
    const result = getDefinedFields({
      ...emptyPolicy,
      schedule: { trigger: "MANUAL", interval: undefined },
      retention: { latest: 10, hourly: undefined },
    });

    expect(result.schedule).toEqual(["trigger"]);
    expect(result.retention).toEqual(["latest"]);
  });

  it("returns empty arrays for empty sections", () => {
    const result = getDefinedFields(emptyPolicy);

    expect(result.schedule).toEqual([]);
    expect(result.retention).toEqual([]);
    expect(result.files).toEqual([]);
    expect(result.compression).toEqual([]);
  });
});

describe("convertPolicyFromCore", () => {
  it("returns null for falsy input", () => {
    expect(convertPolicyFromCore(null as any)).toBeNull();
  });

  it("maps retention fields", () => {
    const core = minimalCorePolicy({
      retention: {
        keepLatest: 10,
        keepHourly: 24,
        keepDaily: 7,
        keepWeekly: 4,
        keepMonthly: 12,
        keepAnnual: 3,
        ignoreIdenticalSnapshots: true,
      },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.retention).toEqual({
      latest: 10,
      hourly: 24,
      daily: 7,
      weekly: 4,
      monthly: 12,
      annual: 3,
      ignoreIdentical: true,
    });
  });

  it("maps file exclusions", () => {
    const core = minimalCorePolicy({
      files: { ignore: ["*.log", "temp*"] },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.files.exclusions).toEqual([
      { rule: "*.log" },
      { rule: "temp*" },
    ]);
  });

  it("maps maxFileSize using fromBytes", () => {
    const core = minimalCorePolicy({
      files: { maxFileSize: 1_000_000 },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.files.maxFileSize).toEqual({ value: 1, unit: "MB" });
  });

  it("maps manual schedule", () => {
    const core = minimalCorePolicy({
      scheduling: { manual: true },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.schedule.trigger).toBe("MANUAL");
  });

  it("maps scheduled trigger", () => {
    const core = minimalCorePolicy({
      scheduling: { manual: false, intervalSeconds: 3600 },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.schedule.trigger).toBe("SCHEDULE");
    expect(result.schedule.interval).toBe("3600");
  });

  it("maps timeOfDay", () => {
    const core = minimalCorePolicy({
      scheduling: { timeOfDay: [{ hour: 9, min: 30 }] },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.schedule.times).toEqual([{ hour: 9, minute: 30 }]);
  });

  it("maps cron expressions", () => {
    const core = minimalCorePolicy({
      scheduling: { cron: ["0 0 * * *", "0 12 * * 1-5"] },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.schedule.cron).toEqual([
      { id: "0-0 0 * * *", expression: "0 0 * * *" },
      { id: "1-0 12 * * 1-5", expression: "0 12 * * 1-5" },
    ]);
  });

  it("maps compression with empty compressorName to undefined", () => {
    const core = minimalCorePolicy({
      compression: { compressorName: "" },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.compression.algorithm).toBeUndefined();
  });

  it("maps compression file size limits", () => {
    const core = minimalCorePolicy({
      compression: { minSize: 1000, maxSize: 1_000_000_000 },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.compression.minFileSize).toEqual({ value: 1, unit: "KB" });
    expect(result.compression.maxFileSize).toEqual({ value: 1, unit: "GB" });
  });

  it("maps error handling", () => {
    const core = minimalCorePolicy({
      errorHandling: {
        ignoreFileErrors: true,
        ignoreDirectoryErrors: false,
        ignoreUnknownTypes: true,
      },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.errors).toEqual({
      ignoreFile: true,
      ignoreDirectory: false,
      ignoreUnknown: true,
    });
  });

  it("maps scripts/actions", () => {
    const core = minimalCorePolicy({
      actions: {
        beforeFolder: { script: "echo before", timeout: 30, mode: "essential" },
        afterSnapshotRoot: { script: "echo after" },
      },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.scripts.beforeFolder).toEqual({
      script: "echo before",
      timeout: 30,
      mode: "essential",
    });
    expect(result.scripts.afterSnapshot).toEqual({
      script: "echo after",
    });
  });

  it("maps logging entries to files", () => {
    const core = minimalCorePolicy({
      logging: {
        entries: { snapshotted: 1, ignored: 2, cacheHit: 3, cacheMiss: 4 },
      },
    });

    const result = convertPolicyFromCore(core)!;

    expect(result.logging.files).toEqual({
      snapshotted: 1,
      ignored: 2,
      cache: { hit: 3, miss: 4 },
    });
  });
});

describe("convertPolicyToCore", () => {
  it("maps retention fields back", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      retention: { latest: 10, hourly: 24 },
    });

    expect(result.retention.keepLatest).toBe(10);
    expect(result.retention.keepHourly).toBe(24);
  });

  it("maps MANUAL trigger to manual: true", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      schedule: { trigger: "MANUAL" },
    });

    expect(result.scheduling.manual).toBe(true);
  });

  it("maps SCHEDULE trigger to manual: false with interval", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      schedule: { trigger: "SCHEDULE", interval: "3600" },
    });

    expect(result.scheduling.manual).toBe(false);
    expect(result.scheduling.intervalSeconds).toBe(3600);
  });

  it("omits scheduling fields when trigger is MANUAL", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      schedule: {
        trigger: "MANUAL",
        interval: "3600",
        cron: [{ id: "1", expression: "0 0 * * *" }],
      },
    });

    expect(result.scheduling.manual).toBe(true);
    expect(result.scheduling.intervalSeconds).toBeUndefined();
    expect(result.scheduling.cron).toBeUndefined();
  });

  it("prepends dot to compression extensions", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      compression: {
        extensionAllowlist: ["jpg", ".png"],
        extensionDenylist: ["zip", ".tar"],
      },
    });

    expect(result.compression.onlyCompress).toEqual([".jpg", ".png"]);
    expect(result.compression.neverCompress).toEqual([".zip", ".tar"]);
  });

  it("maps file exclusions back", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      files: { exclusions: [{ rule: "*.log" }, { rule: "temp*" }] },
    });

    expect(result.files.ignore).toEqual(["*.log", "temp*"]);
  });

  it("maps scripts back to actions", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      scripts: {
        beforeFolder: { script: "echo hi" },
        afterSnapshot: { script: "echo done" },
      },
    });

    expect(result.actions.beforeFolder).toEqual({ script: "echo hi" });
    expect(result.actions.afterSnapshotRoot).toEqual({ script: "echo done" });
  });

  it("maps logging files back to entries", () => {
    const result = convertPolicyToCore({
      ...emptyPolicy,
      logging: {
        directories: { snapshotted: 5, ignored: 5 },
        files: {
          snapshotted: 1,
          ignored: 2,
          cache: { hit: 3, miss: 4 },
        },
      },
    });

    expect(result.logging.entries).toEqual({
      snapshotted: 1,
      ignored: 2,
      cacheHit: 3,
      cacheMiss: 4,
    });
  });
});

describe("roundtrip with defaultVaultPolicy", () => {
  it("preserves retention through toCore → fromCore", () => {
    const core = convertPolicyToCore(defaultVaultPolicy);
    const ui = convertPolicyFromCore(core)!;

    expect(ui.retention).toEqual(defaultVaultPolicy.retention);
  });

  it("preserves errors through toCore → fromCore", () => {
    const core = convertPolicyToCore(defaultVaultPolicy);
    const ui = convertPolicyFromCore(core)!;

    expect(ui.errors).toEqual(defaultVaultPolicy.errors);
  });

  it("preserves logging through toCore → fromCore", () => {
    const core = convertPolicyToCore(defaultVaultPolicy);
    const ui = convertPolicyFromCore(core)!;

    expect(ui.logging).toEqual(defaultVaultPolicy.logging);
  });
});

function minimalCorePolicy(overrides: Partial<CorePolicy> = {}): CorePolicy {
  return {
    retention: {},
    files: {},
    errorHandling: {},
    scheduling: {},
    compression: {},
    metadataCompression: {},
    splitter: {},
    actions: {},
    osSnapshots: {},
    logging: {},
    upload: {},
    ...overrides,
  } as CorePolicy;
}
