import {
  AlertTriangleIcon,
  InfoIcon,
  LockIcon,
  OctagonAlertIcon,
} from "lucide-react";

export function Problems() {
  return (
    <section
      id="problems"
      className="w-content mx-auto flex flex-col items-center py-16 sm:py-32"
    >
      <div className="flex items-center gap-5">
        <AlertTriangleIcon className="hidden size-10 text-red-500 sm:block" />
        <h2 className="text-center text-4xl font-bold sm:text-5xl">
          Your files are at risk
        </h2>
      </div>
      <p className="sm:w-145 text-muted-foreground mt-4 w-full text-center text-sm md:text-base">
        You might think your files are safe, but that safety is often just an
        illusion. Most people only keep one copy of their data, and one copy is
        never enough.
      </p>
      <div className="mt-18 grid w-full grid-cols-1 gap-16 xl:grid-cols-3 xl:gap-8">
        <Problem
          title="A wrong click and everything’s gone"
          description="Delete the wrong folder, overwrite a file, “clean up” something important. It happens. A few clicks can erase months of progress or irreplaceable memories."
        >
          <p className="font-medium">
            Are you sure you want to permanently delete this folder?
          </p>
          <div className="mt-4 flex w-full justify-end gap-2">
            <div className="border-foreground/20 w-fit rounded-md border px-3 py-1.5 text-sm font-medium">
              Cancel
            </div>
            <div className="w-fit rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white">
              Delete
            </div>
          </div>
        </Problem>
        <Problem
          title="Every hard drive dies and yours will too"
          description="It’s not about if, but when. One day it just doesn’t spin up, or your SSD quietly corrupts files without warning. All those photos, projects, and memories… gone in an instant."
        >
          <div className="my-auto flex w-full flex-col items-center">
            <OctagonAlertIcon className="mx-auto size-8 text-red-500" />
            <p className="mt-3 text-center text-xl font-medium">
              Failed to start device
            </p>
            <p className="text-muted-foreground mt-1 text-center text-xs">
              Error: DISK_IS_CORRUPTED
            </p>
          </div>
        </Problem>
        <Problem
          title="Hackers don’t care about your files"
          description="One careless click, and ransomware locks you out of everything you care about. Your documents, your photos, your digital life held hostage."
        >
          <LockIcon className="size-8 text-red-500" />
          <div className="flex flex-col">
            <p className="text-base font-medium">
              Your files have been encrypted!
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Send us $1,000 worth of bitcoin to recover your files.
            </p>
          </div>
        </Problem>
      </div>
      <div className="sm:w-140 mt-24 flex w-full flex-col gap-2 rounded-xl sm:mt-20">
        <div className="flex items-center gap-3">
          <InfoIcon className="size-6 text-red-500" />
          <h3 className="text-2xl font-bold">Cloud storage isn’t a backup</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Services like iCloud, OneDrive, or Google Drive might feel safe, but
          they’re not real backups. They only keep the latest version of each
          file. Delete or overwrite something, and it’s gone there too.{" "}
        </p>
        <blockquote className="border-foreground/30 text-muted-foreground mt-2 border-l-2 pl-4 text-sm">
          “Cloud storage syncs your mistakes, a true backup protects you from
          them.”
        </blockquote>
      </div>
    </section>
  );
}

type ProblemProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

function Problem({ title, description, children }: ProblemProps) {
  return (
    <div className="lg:gap-30 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10 md:gap-20 xl:flex-col xl:items-start xl:gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold sm:text-3xl">{title}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <div className="max-w-90 relative mx-auto flex aspect-video w-full shrink-0 flex-col items-start justify-between rounded-xl border-2 border-red-500/10 bg-red-500/10 p-2 sm:w-80 md:m-0 dark:bg-red-500/5">
        <div className="bg-card flex h-full w-full flex-col justify-between rounded-lg border p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
