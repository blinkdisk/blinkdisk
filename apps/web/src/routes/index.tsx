import { Logo } from "@blinkdisk/components/logo";
import { Button } from "@blinkdisk/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { DownloadIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Logo className="h-10" />
      <Button
        render={
          <a
            href={`${process.env.MARKETING_URL}/download`}
            target="_blank"
            rel="noreferrer"
          />
        }
        size="xl"
        className="mt-8"
      >
        <DownloadIcon />
        Download
      </Button>
    </div>
  );
}
