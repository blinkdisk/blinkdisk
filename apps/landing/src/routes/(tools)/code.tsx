import { CodeStatsForm } from "@landing/components/tools/code/form";
import { CodeStatsResult } from "@landing/components/tools/code/result";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(tools)/code")({
  component: RouteComponent,
  head: head({
    title: "Codebase Statistics Calculator",
    description:
      "Get insights into your projects’ codebase, right in your browser. Count lines of code, characters, files, and much more at a glance.",
    og: {
      title: "Your Codebase, by the numbers.",
      image: "/brand/code.jpg",
    },
  }),
});

export type CodeStatsFile = {
  path: string;
  language: string;
  lines: number;
  characters: number;
};

export type CodeStatsRepository = {
  provider: "github" | "gitlab";
  owner: string;
  name: string;
};

function RouteComponent() {
  const [repository, setRepository] = useState<CodeStatsRepository | null>(
    null,
  );
  const [files, setFiles] = useState<CodeStatsFile[]>([]);

  return (
    <div className="sm:pt-50 flex min-h-screen flex-col items-center py-12 sm:pb-20">
      <div className="mt-auto"></div>
      {!files.length ? (
        <CodeStatsForm setFiles={setFiles} setRepository={setRepository} />
      ) : (
        <CodeStatsResult
          files={files}
          repository={repository}
          reset={() => {
            setFiles([]);
            setRepository(null);
          }}
        />
      )}
      <div className="mb-auto"></div>
    </div>
  );
}
