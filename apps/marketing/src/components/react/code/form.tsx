import { CodeStatsDropzone } from "@/components/react/code/dropzone";
import { useClipboard } from "@/hooks/use-clipboard";
import type { CodeStatsFile, CodeStatsRepository } from "@/components/react/code/types";
import {
  excludedExtensions,
  extensionToLanguage,
} from "@/utils/extension";
import { Alert, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import JSZip from "jszip";
import {
  ArchiveIcon,
  ChartLineIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "lucide-react";
import type { FormEvent, ReactElement } from "react";
import {
  cloneElement,
  useCallback,
  useState,
} from "react";
import { toast } from "sonner";

type Provider = "github" | "gitlab" | "other";

type Visibility = "public" | "private";

const command = `git archive HEAD -o Code.zip`;

const ALLOWED_GITLAB_HOSTS = ["gitlab.com", "gitlab.gnome.org", "gitlab.freedesktop.org", "invent.kde.org"];

function isValidGitlabHost(host: string): boolean {
  const normalized = host.toLowerCase().trim();
  return ALLOWED_GITLAB_HOSTS.includes(normalized);
}

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
    async (file: Parameters<typeof JSZip.loadAsync>[0]) => {
      const zip = await JSZip.loadAsync(file);

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

      if (provider === "gitlab" && !isValidGitlabHost(host)) {
        toast.error("Invalid GitLab host", {
          description: "Only public GitLab instances are supported.",
        });
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `https://git-proxy.blinkdisk.com/${provider}/${provider === "gitlab" ? `${encodeURIComponent(host)}/` : ""}${encodeURIComponent(username)}/${encodeURIComponent(repository)}`,
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
        Get insights into your projects' codebase, right in your browser. Count
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
                <svg viewBox="0 0 100 100" fill="currentColor" className="size-4 mr-1">
                  <path d="M50 5C25.1488 5 5 25.1489 5 50C5 69.9799 18.2134 86.8878 36.1995 92.8413C38.4419 93.2603 39.2824 91.8869 39.2824 90.7034C39.2824 89.6305 39.2399 86.1466 39.2186 82.1813C27.0685 84.7142 24.4405 76.9614 24.4405 76.9614C22.4001 71.8227 19.4579 70.4493 19.4579 70.4493C15.3715 67.6601 19.7509 67.7176 19.7509 67.7176C24.2551 68.0366 26.6223 72.3373 26.6223 72.3373C30.6088 79.2115 36.9889 77.3574 39.3886 76.2208C39.7969 73.2418 40.9911 71.205 42.3114 70.0959C32.4817 68.9762 22.167 65.1001 22.167 47.7681C22.167 42.9011 23.9159 38.8996 26.7285 35.7413C26.2627 34.6216 24.7299 30.0368 27.1624 23.8252C27.1624 23.8252 30.9128 22.6374 39.1505 28.4588C42.7127 27.4816 46.5668 26.9866 50.4209 26.9654C54.275 26.9972 58.1186 27.4816 61.6914 28.4694C69.919 22.648 73.6588 23.8358 73.6588 23.8358C76.102 30.0474 74.5692 34.6322 74.1034 35.7519C76.9266 38.8996 78.6542 42.9118 78.6542 47.7787C78.6542 65.1532 68.3181 68.9656 58.4565 70.0641C60.1097 71.4588 61.5893 74.2055 61.5893 78.4318C61.5893 84.4597 61.5362 89.3161 61.5362 90.7034C61.5362 91.8976 62.3555 93.2815 64.6405 92.8307C82.8073 86.8665 96 69.969 96 50C96 25.1489 75.8512 5 50 5Z" />
                </svg>
                GitHub
              </TabsTrigger>
              <TabsTrigger value="gitlab">
                <svg viewBox="0 0 100 100" fill="currentColor" className="size-4 mr-1">
                  <path d="M95.876 39.4759L95.7947 39.2321L82.3907 2.94607C82.1631 2.36527 81.7648 1.86916 81.249 1.52182C80.7326 1.18158 80.1293 0.996626 79.5121 0.989043C78.8948 0.98146 78.2873 1.15168 77.7626 1.47895C77.2435 1.8154 76.8301 2.29341 76.5711 2.85813L67.4125 26.2133H32.5874L23.4289 2.85813C23.1764 2.28928 22.7648 1.80687 22.2458 1.46777C21.7211 1.14049 21.1137 0.970277 20.4964 0.977861C19.8791 0.985447 19.2758 1.1704 18.7594 1.51064C18.2446 1.86056 17.8465 2.3568 17.6176 2.93731L4.20489 39.2189L4.12351 39.4627C2.41987 44.0916 2.0842 49.1272 3.15852 53.9497C4.23284 58.7723 6.66979 63.1728 10.167 66.6384L10.2047 66.6739L10.2951 66.7529L32.3152 83.5776L43.2256 92.0062L49.9269 97.1759C50.5612 97.6631 51.3285 97.9254 52.1178 97.9254C52.9071 97.9254 53.6743 97.6631 54.3087 97.1759L61.01 92.0062L71.9204 83.5776L89.7866 66.6871L89.8324 66.6384C93.3238 63.176 95.7572 58.7818 96.8321 53.966C97.907 49.1503 97.5756 44.1211 95.876 39.4959V39.4759Z" />
                </svg>
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
