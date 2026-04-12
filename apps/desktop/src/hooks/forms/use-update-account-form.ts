import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZUpdateAccount } from "@blinkdisk/schemas/accounts";
import { useUpdateAccount } from "@desktop/hooks/mutations/use-update-account";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useMemo } from "react";

export function useUpdateAccountForm() {
  const { data: account } = useAccount();
  const { mutateAsync } = useUpdateAccount(() => form.reset());

  const [firstName, lastName] = useMemo(() => {
    if (!account) return [null, null];
    const parts = account.name.split(" ");

    return [parts[0] ?? "", parts.length > 1 ? (parts[1] ?? "") : ""] as [
      string,
      string,
    ];
  }, [account]);

  const form = useAppForm({
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: account?.email || "",
    },
    validators: {
      onSubmit: ZUpdateAccount,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
