import { exampleFolders } from "@config/folder";
import { Folder } from "@landing/components/folder";
import { cn } from "@utils/class";
import { LockIcon } from "lucide-react";
import ReactMarquee from "react-fast-marquee";

const steps = [
  {
    title: "Choose folders to protect",
    description:
      "Pick all folders you want to protect. We take care of everything else, with no complex setup.",
  },
  {
    title: "Create your first backup",
    description:
      "Once set up, BlinkDisk starts to backup your files in the background. You’ll always have secure copies.",
  },
  {
    title: "Restore any file, anytime ",
    description:
      "When something goes wrong, simply open BlinkDisk and restore any file in seconds.",
  },
];

export function Solution() {
  return (
    <section
      id="solution"
      className="w-content mx-auto flex flex-col items-center py-16 sm:py-24"
    >
      <div className="flex items-center gap-5">
        <LockIcon className="text-primary hidden size-10 md:block" />
        <h2 className="text-center text-4xl font-bold sm:text-5xl">
          Get protected in <br className="sm:hidden" />
          <span className="sm:hidden">a few</span> minutes
        </h2>
      </div>
      <p className="md:w-160 text-muted-foreground mt-4 w-full text-center text-sm md:text-base">
        BlinkDisk gives your files the protection they deserve. It automatically
        creates secure, encrypted backups. So no matter what happens, your files
        are always safe.
      </p>
      <div className="mt-10 grid grid-cols-1 md:mt-20 md:grid-cols-3">
        {steps.map(({ title, description }, index) => (
          <Step
            key={title}
            title={title}
            description={description}
            index={index}
            first={index === 0}
            last={index === steps.length - 1}
          />
        ))}
      </div>
      <ReactMarquee
        speed={50}
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
        className="mt-18 md:mt-24"
      >
        <div className="flex items-center gap-8 pl-8">
          {exampleFolders.map((folder) => (
            <Folder key={folder.name} folder={{ ...folder, emoji: "📁" }} />
          ))}
        </div>
      </ReactMarquee>
    </section>
  );
}

type StepProps = {
  title: string;
  description: string;
  index: number;
  first?: boolean;
  last?: boolean;
};

function Step({ title, description, index, first, last }: StepProps) {
  return (
    <div className="flex w-full flex-row items-center gap-8 md:flex-col md:gap-0">
      <div className="flex h-full flex-col items-center md:h-auto md:w-full md:flex-row">
        <hr
          className={cn(
            "border-primary/30 grow border-l-2 md:border-t-2",
            first && "invisible",
          )}
        />
        <div className="bg-primary/10 border-primary/30 flex size-10 items-center justify-center rounded-lg border md:size-12">
          <span className="text-primary whitespace-nowrap text-lg font-medium md:text-xl">
            {index + 1}
          </span>
        </div>
        <hr
          className={cn(
            "border-primary/30 grow border-l-2 md:border-t-2",
            last && "invisible",
          )}
        />
      </div>
      <div className="flex w-[90%] flex-col items-start gap-2 py-4 sm:mt-6 sm:py-0 md:items-center md:text-center">
        <h3 className="text-xl font-semibold md:text-2xl md:font-bold">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
