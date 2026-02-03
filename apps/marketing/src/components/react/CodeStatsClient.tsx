import { useState } from "react";
import { CodeStatsForm } from "@/components/react/code/form";
import { CodeStatsResult } from "@/components/react/code/result";
import type { CodeStatsFile, CodeStatsRepository } from "@/components/react/code/types";

export default function CodeStatsClient() {
  const [repository, setRepository] = useState<CodeStatsRepository | null>(
    null,
  );
  const [files, setFiles] = useState<CodeStatsFile[]>([]);

  return (
    <div className="py-page flex min-h-screen flex-col items-center">
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
