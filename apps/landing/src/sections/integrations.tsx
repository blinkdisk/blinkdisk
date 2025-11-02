import { LinuxIcon } from "@landing/components/icons/linux";
import { MacosIcon } from "@landing/components/icons/macos";
import { WindowsIcon } from "@landing/components/icons/windows";
import { usePlatform } from "@landing/hooks/use-platform";
import { Button } from "@ui/button";

export function Integrations() {
  return (
    <section
      id="integrations"
      className="w-content mx-auto flex flex-col items-center py-16 sm:py-24"
    >
      <h2 className="text-center text-4xl font-bold sm:text-5xl">
        Backup from anywhere
      </h2>
      <p className="text-muted-foreground mt-4 text-center text-sm md:text-base">
        BlinkDisk runs on all major operating systems, including Windows, macOS
        and Linux.
      </p>
      <div className="sm:mt-22 mt-16 grid w-full grid-cols-1 gap-10 sm:grid-cols-3 md:gap-0">
        <OperatingSystem
          name="Windows"
          icon={WindowsIcon}
          description="Windows 11 and Windows 10 with 64-bit supported."
        />
        <OperatingSystem
          name="macOS"
          icon={MacosIcon}
          description="Big Sur and all newer versions of macOS are supported."
        />
        <OperatingSystem
          name="Linux"
          icon={LinuxIcon}
          description="AppImage, deb, and rpm for x86_64, arm64 and armv7l."
        />
      </div>
    </section>
  );
}

type OperatingSystemProps = {
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

function OperatingSystem({ name, description, icon }: OperatingSystemProps) {
  const Icon = icon;

  const { platform } = usePlatform();

  return (
    <div className="max-w-70 mx-auto flex w-full flex-col items-start sm:items-center [&>svg]:size-10">
      <div className="flex flex-row items-center gap-4 sm:flex-col">
        <Icon />
        <p className="text-3xl font-bold">{name}</p>
      </div>
      <p className="text-muted-foreground sm:max-w-50 mt-2 w-full text-sm sm:text-center">
        {description}
      </p>
      <Button
        as="link"
        to="/download"
        className="mt-4 w-full sm:mt-6 sm:w-auto"
        variant={platform === name.toLowerCase() ? "default" : "outline"}
      >
        Download
      </Button>
    </div>
  );
}
