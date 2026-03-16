import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ManualToast({
  t,
  authorizationCode,
}: {
  t: string | number;
  authorizationCode: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-background flex items-start gap-2 rounded-lg border p-4">
      <div className="flex flex-col gap-2 text-xs">
        <p className="font-semibold">Having trouble being redirected?</p>
        <p className="text-muted-foreground">
          Copy and paste the code into the app to continue.
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(authorizationCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-muted-foreground pointer-events-auto! hover:text-foreground focus-visible:text-foreground inline-flex items-center gap-2 transition-colors"
        >
          {authorizationCode}
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
      </div>
      <button onClick={() => toast.dismiss(t)}>
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
