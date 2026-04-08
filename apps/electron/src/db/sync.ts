import { globalAccountDirectory } from "@electron/path";
import { trpc } from "@electron/trpc";
import createFilesystemAdapter from "@signaldb/fs";
import { SyncManager } from "@signaldb/sync";
import { join } from "node:path";

const syncManager = new SyncManager({
  persistenceAdapter: (name: string) =>
    createFilesystemAdapter(
      join(globalAccountDirectory(), `${name}.sync.json`),
    ),
  pull: async () => {
    trpc.cloudblink.space.query(undefined, {
      context: {
        test: 123,
      },
    });
    // your pull logic
  },
  push: async () => {
    // your push logic
  },
});
