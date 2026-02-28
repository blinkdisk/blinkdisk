import { convertThrottleFromCore, convertThrottleToCore } from "./throttle";

describe("convertThrottleFromCore", () => {
  it("returns null for falsy input", () => {
    expect(convertThrottleFromCore(null as any)).toBeNull();
  });

  it("converts enabled upload and download speeds", () => {
    const result = convertThrottleFromCore({
      maxUploadSpeedBytesPerSecond: 1_000_000,
      maxDownloadSpeedBytesPerSecond: 5_000_000,
    });

    expect(result).toEqual({
      upload: {
        enabled: true,
        limit: { value: 1, unit: "Mbps" },
      },
      download: {
        enabled: true,
        limit: { value: 5, unit: "Mbps" },
      },
    });
  });

  it("sets enabled false when speeds are absent", () => {
    const result = convertThrottleFromCore({});

    expect(result).toEqual({
      upload: {
        enabled: false,
        limit: { value: 0, unit: "Mbps" },
      },
      download: {
        enabled: false,
        limit: { value: 0, unit: "Mbps" },
      },
    });
  });

  it("sets enabled false when speeds are zero", () => {
    const result = convertThrottleFromCore({
      maxUploadSpeedBytesPerSecond: 0,
      maxDownloadSpeedBytesPerSecond: 0,
    });

    expect(result).toEqual({
      upload: {
        enabled: false,
        limit: { value: 0, unit: "Mbps" },
      },
      download: {
        enabled: false,
        limit: { value: 0, unit: "Mbps" },
      },
    });
  });
});

describe("convertThrottleToCore", () => {
  it("includes speed when enabled", () => {
    const result = convertThrottleToCore({
      upload: {
        enabled: true,
        limit: { value: 10, unit: "Mbps" },
      },
      download: {
        enabled: true,
        limit: { value: 50, unit: "Mbps" },
      },
    });

    expect(result).toEqual({
      maxUploadSpeedBytesPerSecond: 10_000_000,
      maxDownloadSpeedBytesPerSecond: 50_000_000,
    });
  });

  it("sets undefined when disabled", () => {
    const result = convertThrottleToCore({
      upload: {
        enabled: false,
        limit: { value: 10, unit: "Mbps" },
      },
      download: {
        enabled: false,
        limit: { value: 50, unit: "Mbps" },
      },
    });

    expect(result).toEqual({
      maxUploadSpeedBytesPerSecond: undefined,
      maxDownloadSpeedBytesPerSecond: undefined,
    });
  });
});

describe("roundtrip", () => {
  it("preserves values through core → UI → core", () => {
    const core = {
      maxUploadSpeedBytesPerSecond: 1_000_000,
      maxDownloadSpeedBytesPerSecond: 5_000_000,
    };

    const ui = convertThrottleFromCore(core)!;
    const result = convertThrottleToCore(ui);

    expect(result).toEqual(core);
  });
});
