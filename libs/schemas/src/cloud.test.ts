import {
  ZCloudDeleteBlob,
  ZCloudGetBlob,
  ZCloudGetMetadata,
  ZCloudListBlobs,
  ZCloudPutBlob,
} from "@schemas/cloud";

describe("cloud schemas", () => {
  it.each([
    ["../secret"],
    ["folder/../../secret"],
    ["folder\\..\\secret"],
  ])("rejects traversal blob keys: %s", (key) => {
    expect(
      ZCloudPutBlob.safeParse({ requestId: "req", key, size: 1 }).success,
    ).toBe(false);
    expect(ZCloudGetBlob.safeParse({ requestId: "req", key }).success).toBe(
      false,
    );
    expect(ZCloudDeleteBlob.safeParse({ requestId: "req", key }).success).toBe(
      false,
    );
    expect(ZCloudGetMetadata.safeParse({ requestId: "req", key }).success).toBe(
      false,
    );
  });

  it("allows empty list prefixes but rejects traversal prefixes", () => {
    expect(
      ZCloudListBlobs.safeParse({ requestId: "req", prefix: "" }).success,
    ).toBe(true);
    expect(
      ZCloudListBlobs.safeParse({ requestId: "req", prefix: "../" }).success,
    ).toBe(false);
  });

  it("requires non-negative integer blob sizes", () => {
    expect(
      ZCloudPutBlob.safeParse({ requestId: "req", key: "a", size: 0 }).success,
    ).toBe(true);
    expect(
      ZCloudPutBlob.safeParse({ requestId: "req", key: "a", size: -1 }).success,
    ).toBe(false);
    expect(
      ZCloudPutBlob.safeParse({ requestId: "req", key: "a", size: 1.5 })
        .success,
    ).toBe(false);
  });
});
