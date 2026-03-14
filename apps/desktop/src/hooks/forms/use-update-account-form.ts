import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZUpdateUser } from "@blinkdisk/schemas/settings";
import { useUpdateAccount } from "@desktop/hooks/mutations/use-update-account";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useMemo } from "react";

export function useUpdateAccountForm() {
  const { data: session } = useAccount();
  const { mutateAsync } = useUpdateAccount(() => form.reset());

  const user = useMemo(() => {
    if (!session) return null;
    return session.user;
  }, [session]);

  const [firstName, lastName] = useMemo(() => {
    if (!user) return [null, null];
    const parts = user.name.split(" ");

    return [parts[0] ?? "", parts.length > 1 ? (parts[1] ?? "") : ""] as [
      string,
      string,
    ];
  }, [user]);

  const form = useAppForm({
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: user?.email || "",
    },
    validators: {
      onSubmit: ZUpdateUser,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
