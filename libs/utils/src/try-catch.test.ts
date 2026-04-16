import { tryCatch } from "./try-catch";
import { CustomError } from "./error";

describe("tryCatch", () => {
  describe("sync function", () => {
    it("returns value on success", () => {
      const [data, error] = tryCatch(() => 42);
      expect(data).toBe(42);
      expect(error).toBeUndefined();
    });

    it("returns error on throw", () => {
      const [data, error] = tryCatch(() => {
        throw new Error("fail");
      });
      expect(data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("fail");
    });
  });

  describe("async function", () => {
    it("returns value on success", async () => {
      const [data, error] = await tryCatch(async () => 42);
      expect(data).toBe(42);
      expect(error).toBeUndefined();
    });

    it("returns error on throw", async () => {
      const [data, error] = await tryCatch(async () => {
        throw new Error("fail");
      });
      expect(data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("fail");
    });
  });

  describe("direct promise", () => {
    it("returns value on resolve", async () => {
      const [data, error] = await tryCatch(Promise.resolve(42));
      expect(data).toBe(42);
      expect(error).toBeUndefined();
    });

    it("returns error on rejection", async () => {
      const [data, error] = await tryCatch(
        Promise.reject(new Error("fail")),
      );
      expect(data).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("fail");
    });
  });

  it("preserves custom error type", () => {
    const customErr = new CustomError("VAULT_NOT_FOUND");
    const [data, error] = tryCatch(() => {
      throw customErr;
    });
    expect(data).toBeUndefined();
    expect(error).toBe(customErr);
    expect(error).toBeInstanceOf(CustomError);
    expect((error as CustomError).code).toBe("VAULT_NOT_FOUND");
  });
});
