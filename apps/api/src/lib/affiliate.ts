import axios from "axios";

export async function trackAffiliateSignup(
  env: CloudflareBindings,
  referralId: string,
) {
  await axios.post(
    "https://app.endorsely.com/api/public/refer",
    {
      status: "Signed Up",
      referralId: referralId,
      organizationId: env.ENDORSELY_ORGANIZATION_ID,
    },
    {
      headers: {
        Authorization: `Bearer ${env.ENDORSELY_PRIVATE_KEY}`,
      },
    },
  );
}

export async function trackAffiliatePayment(
  env: CloudflareBindings,
  fields: {
    referralId: string;
    email: string;
    amount: number;
    name: string;
    customerId: string;
  },
) {
  await axios.post(
    "https://app.endorsely.com/api/public/refer",
    {
      organizationId: env.ENDORSELY_ORGANIZATION_ID,
      ...fields,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ENDORSELY_PRIVATE_KEY}`,
      },
    },
  );
}
