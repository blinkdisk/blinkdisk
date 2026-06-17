import {
  ZChangePlan,
  ZChangePlanForm,
  ZCreateCheckout,
} from "@schemas/payment";

describe("payment schemas", () => {
  it("requires checkout and change-plan price ids", () => {
    expect(ZCreateCheckout.safeParse({ priceId: "price_1" }).success).toBe(
      true,
    );
    expect(ZCreateCheckout.safeParse({ priceId: "" }).success).toBe(false);

    expect(ZChangePlan.safeParse({ priceId: "price_1" }).success).toBe(true);
    expect(ZChangePlan.safeParse({ priceId: "" }).success).toBe(false);
  });

  it("requires explicit change-plan confirmation", () => {
    expect(ZChangePlanForm.safeParse({ confirmed: true }).success).toBe(true);
    expect(ZChangePlanForm.safeParse({ confirmed: false }).success).toBe(false);
  });
});
