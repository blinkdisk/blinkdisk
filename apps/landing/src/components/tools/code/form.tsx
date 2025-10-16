import { GithubIcon } from "@landing/components/icons/github";
import { GitlabIcon } from "@landing/components/icons/gitlab";
import { CodeStatsDropzone } from "@landing/components/tools/code/dropzone";
import { useClipboard } from "@landing/hooks/use-clipboard";
import {
  CodeStatsFile,
  CodeStatsRepository,
} from "@landing/routes/(tools)/code";
import {
  excludedExtensions,
  extensionToLanguage,
} from "@landing/utils/extension";
import { Alert, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { loadAsync as parseZip } from "jszip";
import {
  ArchiveIcon,
  ChartLineIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "lucide-react";
import {
  cloneElement,
  FormEvent,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { toast } from "sonner";

type Provider = "github" | "gitlab" | "other";

type Visibility = "public" | "private";

const command = `git archive HEAD -o Code.zip`;

type CodeStatsFormProps = {
  setFiles: (files: CodeStatsFile[]) => void;
  setRepository: (repository: CodeStatsRepository | null) => void;
};

export function CodeStatsForm({
  setFiles,
  setRepository: setRepositoryParent,
}: CodeStatsFormProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [provider, setProvider] = useState<Provider>("github");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [host, setHost] = useState("gitlab.com");
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");

  const { copy } = useClipboard();

  const loadZip = useCallback(
    async (file: Parameters<typeof parseZip>[0]) => {
      const zip = await parseZip(file);

      setLoading(true);

      const files = Object.values(zip.files);

      const newFiles = [];
      for (const file of files) {
        if (file.dir) continue;

        const splits = file.name.split(".");

        let extension = file.name;
        if (splits.length > 1) extension = splits[splits.length - 1] as string;

        if (excludedExtensions.includes(extension)) continue;

        const language = extensionToLanguage[extension] || "Unknown";
        const content = await file.async("text");

        newFiles.push({
          path: "path" in file && file.path ? (file.path as string) : file.name,
          language,
          characters: content?.replace(/\s*/gm, "").length || 0,
          lines: content?.split("\n").length || 0,
        });
      }

      setFiles(newFiles);

      setRepositoryParent(
        provider !== "other" && visibility === "public"
          ? {
              provider,
              owner: username,
              name: repository,
            }
          : null,
      );

      setLoading(false);
    },
    [setFiles, setRepositoryParent, provider, repository, username, visibility],
  );

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      try {
        setLoading(true);

        const res = await fetch(
          provider === "gitlab"
            ? `https://corsproxy.io/?url=${encodeURIComponent(`https://${host}/api/v4/projects/${encodeURIComponent(`${username}/${repository}`)}/repository/archive.zip`)}`
            : `https://corsproxy.io/?url=https://api.github.com/repos/${username}/${repository}/zipball`,
        );

        if (res.status !== 200) {
          if (res.status === 530) throw new Error(`Can't contact host ${host}`);
          if (res.status === 404) throw new Error("Repository not found");

          throw new Error("Failed to fetch repository");
        }

        const blob = await res.blob();
        await loadZip(blob);
        setLoading(false);
      } catch (e) {
        toast.error(
          (e as { message: string }).message || "Something went wrong",
          {
            description: "Please check your inputs and try again.",
          },
        );

        setLoading(false);
      }
    },
    [host, username, repository, provider, loadZip],
  );

  return (
    <>
      <h1 className="text-primary font-medium sm:text-lg">
        Codebase Statistics Calculator
      </h1>
      <p className="mt-3 text-4xl font-bold sm:text-5xl">
        Your Codebase,
        <br />
        by the numbers.
      </p>
      <p className="text-muted-foreground mt-4 max-w-[80vw] text-center text-sm sm:max-w-sm sm:text-base">
        Get insights into your projects’ codebase, right in your browser. Count
        lines of code, characters, files, and much more at a glance.
      </p>
      <div className="mt-10 flex w-full max-w-[80vw] flex-col items-center gap-4 sm:!max-w-sm">
        <Label label="Repository Provider">
          <Tabs
            value={provider}
            onValueChange={(to) => {
              setProvider(to as Provider);
            }}
          >
            <TabsList className="w-full [&>button]:px-4 [&_svg]:mr-1 [&_svg]:size-4">
              <TabsTrigger value="github">
                <GithubIcon />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="gitlab">
                <GitlabIcon />
                GitLab
              </TabsTrigger>
              <TabsTrigger value="other">
                <ArchiveIcon />
                Other
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Label>
        {provider !== "other" ? (
          <Label label="Repository Visibility">
            <Tabs
              value={visibility}
              onValueChange={(to) => setVisibility(to as Visibility)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="public">
                  <EyeIcon />
                  Public
                </TabsTrigger>
                <TabsTrigger value="private">
                  <EyeOffIcon />
                  Private
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Label>
        ) : null}
      </div>
      {provider !== "other" && visibility === "public" ? (
        <form
          onSubmit={submit}
          className="mt-4 flex w-full max-w-[80vw] flex-col gap-4 sm:!max-w-sm"
        >
          {provider === "gitlab" ? (
            <Label label="Host" id="host">
              <Input
                placeholder="gitlab.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
              />
            </Label>
          ) : null}
          <div className="flex w-full items-end gap-3">
            <Label label="Username" id="username">
              <Input
                className="w-full"
                placeholder={provider === "github" ? "microsoft" : "inkscape"}
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              ></Input>
            </Label>
            <p className="mb-3 opacity-50">/</p>
            <Label label="Repository" id="repository">
              <Input
                className="w-full"
                placeholder={provider === "github" ? "vscode" : "inkscape"}
                autoComplete="off"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                required
              ></Input>
            </Label>
          </div>
          <Button loading={loading} type="submit" className="mt-3 w-full">
            <ChartLineIcon />
            Analyze
          </Button>
        </form>
      ) : (
        <>
          <div className="mt-12 flex flex-col gap-12 md:flex-row md:gap-24">
            <div className="flex max-w-[80vw] flex-col sm:w-80">
              <h2 className="text-2xl font-bold">
                <span className="text-primary">1.</span> Zip your code
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Use the following command to zip your project, excluding all
                files from your .gitignore:
              </p>
              <code className="bg-muted mt-4 rounded-lg border p-3 text-sm">
                {command}
              </code>
              <Button
                onClick={async () => {
                  const success = await copy(command);

                  if (success)
                    toast.success("Copied command to clipboard", {
                      description:
                        "You can now paste it into your project's terminal.",
                    });
                  else
                    toast.error("Failed to copy command to clipboard", {
                      description: "Please try to copy it manually instead.",
                    });

                  setCopied(true);
                }}
                className="mt-4"
                variant={copied ? "outline" : "default"}
              >
                <ClipboardIcon />
                Copy Command
              </Button>
            </div>
            <div className="flex max-w-[80vw] flex-col sm:w-80">
              <h2 className="text-2xl font-bold">
                <span className="text-primary">2.</span> Select .zip file
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Select the generated repo.zip file here:
              </p>
              <CodeStatsDropzone
                onFileChange={loadZip}
                buttonVariant={copied ? "default" : "outline"}
                loading={loading}
              />
              <Alert variant="info" className="max-w-85 mt-5">
                <LockIcon />
                <AlertTitle>Your Code Stays Private</AlertTitle>
                <AlertTitle className="line-clamp-none whitespace-normal text-xs">
                  All analysis happens entirely in your browser and files are
                  never uploaded or stored.
                </AlertTitle>
              </Alert>
            </div>
          </div>
        </>
      )}
    </>
  );
}

type LabelProps = {
  id?: string;
  label: string;
  children: ReactElement;
};

function Label({ id, label, children }: LabelProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-muted-foreground text-sm">
        {label}
      </label>
      {cloneElement(children, {
        // @ts-expect-error wrong types
        id,
        name: id,
      })}
    </div>
  );
}
