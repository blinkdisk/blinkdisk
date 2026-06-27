async function postEndorsely(body: Record<string, unknown>, token: string) {
  const response = await fetch("https://app.endorsely.com/api/public/refer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Endorsely request failed: ${response.status}`);
  }
}

export async function trackAffiliateSignup(
  env: CloudflareBindings,
  referralId: string,
) {
  await postEndorsely(
    {
      status: "Signed Up",
      referralId: referralId,
      organizationId: env.ENDORSELY_ORGANIZATION_ID,
    },
    env.ENDORSELY_PRIVATE_KEY,
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
  await postEndorsely(
    {
      organizationId: env.ENDORSELY_ORGANIZATION_ID,
      ...fields,
    },
    env.ENDORSELY_PRIVATE_KEY,
  );
}
