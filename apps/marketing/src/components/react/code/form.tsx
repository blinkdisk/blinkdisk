import { useClipboard } from "@blinkdisk/hooks/use-clipboard";
import { Alert, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { Input } from "@blinkdisk/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { CodeStatsDropzone } from "@marketing/components/react/code/dropzone";
import type {
  CodeStatsFile,
  CodeStatsRepository,
} from "@marketing/components/react/code/types";
import {
  excludedExtensions,
  extensionToLanguage,
} from "@marketing/utils/extension";
import JSZip from "jszip";
import {
  ArchiveIcon,
  ChartLineIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "lucide-react";
import type { ReactElement, SubmitEvent } from "react";
import { cloneElement, useCallback, useReducer } from "react";
import { toast } from "sonner";

type Provider = "github" | "gitlab" | "other";

type Visibility = "public" | "private";

const command = `git archive HEAD -o Code.zip`;
const excludedExtensionSet = new Set(excludedExtensions);

const ALLOWED_GITLAB_HOSTS = [
  "gitlab.com",
  "gitlab.gnome.org",
  "gitlab.freedesktop.org",
  "invent.kde.org",
];

function isValidGitlabHost(host: string): boolean {
  const normalized = host.toLowerCase().trim();
  return ALLOWED_GITLAB_HOSTS.includes(normalized);
}

type CodeStatsFormProps = {
  setFiles: (files: CodeStatsFile[]) => void;
  setRepository: (repository: CodeStatsRepository | null) => void;
};

type CodeStatsState = {
  copied: boolean;
  loading: boolean;
  provider: Provider;
  visibility: Visibility;
  host: string;
  username: string;
  repository: string;
};

type CodeStatsAction = {
  type: "patch";
  state: Partial<CodeStatsState>;
};

const initialCodeStatsState: CodeStatsState = {
  copied: false,
  loading: false,
  provider: "github",
  visibility: "public",
  host: "gitlab.com",
  username: "",
  repository: "",
};

function codeStatsReducer(state: CodeStatsState, action: CodeStatsAction) {
  return { ...state, ...action.state };
}

export function CodeStatsForm({
  setFiles,
  setRepository: setRepositoryParent,
}: CodeStatsFormProps) {
  const [state, dispatch] = useReducer(codeStatsReducer, initialCodeStatsState);
  const { copied, host, loading, provider, repository, username, visibility } =
    state;

  const { copy } = useClipboard();

  const loadZip = useCallback(
    async (file: Parameters<typeof JSZip.loadAsync>[0]) => {
      const zip = await JSZip.loadAsync(file);

      dispatch({ type: "patch", state: { loading: true } });

      const newFiles = (
        await Promise.all(
          Object.values(zip.files).map(async (file) => {
            if (file.dir) return null;

            const splits = file.name.split(".");

            let extension = file.name;
            if (splits.length > 1)
              extension = splits[splits.length - 1] as string;

            if (excludedExtensionSet.has(extension)) return null;

            const language = extensionToLanguage[extension] || "Unknown";
            const content = await file.async("text");

            return {
              path:
                "path" in file && file.path ? (file.path as string) : file.name,
              language,
              characters: content?.replace(/\s*/gm, "").length || 0,
              lines: content?.split("\n").length || 0,
            };
          }),
        )
      ).filter((file) => file !== null);

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

      dispatch({ type: "patch", state: { loading: false } });
    },
    [setFiles, setRepositoryParent, provider, repository, username, visibility],
  );

  const submit = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (provider === "gitlab" && !isValidGitlabHost(host)) {
        toast.error("Invalid GitLab host", {
          description: "Only public GitLab instances are supported.",
        });
        return;
      }

      try {
        dispatch({ type: "patch", state: { loading: true } });

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
        dispatch({ type: "patch", state: { loading: false } });
      } catch (e) {
        toast.error(
          (e as { message: string }).message || "Something went wrong",
          {
            description: "Please check your inputs and try again.",
          },
        );

        dispatch({ type: "patch", state: { loading: false } });
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
              dispatch({ type: "patch", state: { provider: to as Provider } });
            }}
          >
            <TabsList className="w-full [&>button]:px-4 [&_svg]:mr-1 [&_svg]:size-4">
              <TabsTrigger value="github">
                <svg
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  className="mr-1 size-4"
                >
                  <title>GitHub</title>
                  <path d="M50 5C25.15 5 5 25.15 5 50C5 69.98 18.21 86.89 36.2 92.84C38.44 93.26 39.28 91.89 39.28 90.7C39.28 89.63 39.24 86.15 39.22 82.18C27.07 84.71 24.44 76.96 24.44 76.96C22.4 71.82 19.46 70.45 19.46 70.45C15.37 67.66 19.75 67.72 19.75 67.72C24.26 68.04 26.62 72.34 26.62 72.34C30.61 79.21 36.99 77.36 39.39 76.22C39.8 73.24 40.99 71.2 42.31 70.1C32.48 68.98 22.17 65.1 22.17 47.77C22.17 42.9 23.92 38.9 26.73 35.74C26.26 34.62 24.73 30.04 27.16 23.83C27.16 23.83 30.91 22.64 39.15 28.46C42.71 27.48 46.57 26.99 50.42 26.97C54.27 27 58.12 27.48 61.69 28.47C69.92 22.65 73.66 23.84 73.66 23.84C76.1 30.05 74.57 34.63 74.1 35.75C76.93 38.9 78.65 42.91 78.65 47.78C78.65 65.15 68.32 68.97 58.46 70.06C60.11 71.46 61.59 74.21 61.59 78.43C61.59 84.46 61.54 89.32 61.54 90.7C61.54 91.9 62.36 93.28 64.64 92.83C82.81 86.87 96 69.97 96 50C96 25.15 75.85 5 50 5Z" />
                </svg>
                GitHub
              </TabsTrigger>
              <TabsTrigger value="gitlab">
                <svg
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  className="mr-1 size-4"
                >
                  <title>GitLab</title>
                  <path d="M95.88 39.48L95.79 39.23L82.39 2.95C82.16 2.37 81.76 1.87 81.25 1.52C80.73 1.18 80.13 1 79.51 0.99C78.89 0.98 78.29 1.15 77.76 1.48C77.24 1.82 76.83 2.29 76.57 2.86L67.41 26.21H32.59L23.43 2.86C23.18 2.29 22.76 1.81 22.25 1.47C21.72 1.14 21.11 0.97 20.5 0.98C19.88 0.99 19.28 1.17 18.76 1.51C18.24 1.86 17.85 2.36 17.62 2.94L4.2 39.22L4.12 39.46C2.42 44.09 2.08 49.13 3.16 53.95C4.23 58.77 6.67 63.17 10.17 66.64L10.2 66.67L10.3 66.75L32.32 83.58L43.23 92.01L49.93 97.18C50.56 97.66 51.33 97.93 52.12 97.93C52.91 97.93 53.67 97.66 54.31 97.18L61.01 92.01L71.92 83.58L89.79 66.69L89.83 66.64C93.32 63.18 95.76 58.78 96.83 53.97C97.91 49.15 97.58 44.12 95.88 39.5V39.48Z" />
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
              onValueChange={(to) =>
                dispatch({
                  type: "patch",
                  state: { visibility: to as Visibility },
                })
              }
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
                onChange={(e) =>
                  dispatch({ type: "patch", state: { host: e.target.value } })
                }
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
                onChange={(e) =>
                  dispatch({
                    type: "patch",
                    state: { username: e.target.value },
                  })
                }
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
                onChange={(e) =>
                  dispatch({
                    type: "patch",
                    state: { repository: e.target.value },
                  })
                }
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
        <div className="mt-12 flex flex-col gap-12 md:flex-row md:gap-24">
          <div className="flex max-w-[80vw] flex-col sm:w-80">
            <h2 className="text-2xl font-bold">
              <span className="text-primary">1.</span> Zip your code
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Use the following command to zip your project, excluding all files
              from your .gitignore:
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

                dispatch({ type: "patch", state: { copied: true } });
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
