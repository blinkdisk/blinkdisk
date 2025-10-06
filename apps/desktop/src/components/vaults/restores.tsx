import { useRestoreList } from "@desktop/hooks/queries/use-restore-list";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { CircularProgress } from "@ui/circular-progress";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";

export function VaultRestores() {
  const { data: restores } = useRestoreList();
  const { t } = useAppTranslation("directory.restore");

  if (!restores || !restores.length) return null;
  return (
    <div className="mb-8 flex flex-col gap-4">
      {restores.map((restore) => (
        <div
          key={restore.id}
          className="bg-card relative flex items-center justify-between overflow-hidden rounded-xl border p-3"
        >
          <div
            style={{
              width: `${(restore.progress * 100).toFixed(0)}%`,
            }}
            className="bg-foreground/5 dark:bg-foreground/10 absolute bottom-0 left-0 top-0 transition-all"
          ></div>
          <div className="flex items-center gap-4 pl-1">
            <div className="relative flex size-6 items-center justify-center">
              <AnimatePresence>
                {restore.status === "RUNNING" ? (
                  <motion.div
                    key="progress"
                    initial={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0.5,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  >
                    <CircularProgress
                      value={restore.progress * 100}
                      size={30}
                      strokeWidth={4}
                      progressClassName="opacity-60 dark:opacity-70"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{
                      scale: 0.5,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0.5,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: 0.2,
                    }}
                    style={{
                      translateX: "-50%",
                      translateY: "-50%",
                    }}
                    className="absolute left-1/2 top-1/2"
                  >
                    <CheckIcon className="size-5 text-lime-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col">
              <p className="font-medium">{t("title")}</p>
              <p className="text-muted-foreground text-xs">
                {t(
                  restore.files && restore.directories
                    ? "description.both"
                    : restore.files
                      ? "description.files"
                      : "description.directories",
                  {
                    count:
                      (restore.files ? restore.files : restore.directories) ||
                      0,
                    files: (restore.files || 0).toLocaleString(),
                    directories: (restore.directories || 0).toLocaleString(),
                  },
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              window.electron.shell.open.folder(restore.destination)
            }
            size="sm"
            variant="outline"
          >
            {t("openFolder")}
          </Button>
        </div>
      ))}
    </div>
  );
}
