import { Space } from "@cloud/classes/space";

type FileCache = {
  size: number;
};

export async function getFileCache(
  storage: DurableObjectStorage,
  fileKey: string,
): Promise<FileCache> {
  const fileCache = await storage.get<FileCache>(`file:${fileKey}`);
  if (fileCache) return fileCache;

  return {
    size: 0,
  };
}

async function setFileCache(
  storage: DurableObjectStorage,
  fileKey: string,
  to: FileCache,
) {
  await storage.put(`file:${fileKey}`, to);
}

async function deleteFileCache(storage: DurableObjectStorage, fileKey: string) {
  await storage.delete(`file:${fileKey}`);
}

export async function consumeSpace(
  storage: DurableObjectStorage,
  space: DurableObjectNamespace<Space>,
  fileKey: string,
  newFileSize: number,
) {
  const fileCache = await getFileCache(storage, fileKey);
  const oldFileSize = fileCache.size;

  const delta = newFileSize - oldFileSize;
  if (delta === 0) return {};

  const spaceId = (await storage.get<string>("spaceId")) || "";
  const stub = space.getByName(spaceId);

  const { error, space: spaceStats } = await stub.consume(delta);
  if (error) return { error };

  if (newFileSize === 0) await deleteFileCache(storage, fileKey);
  else {
    fileCache.size = newFileSize;
    await setFileCache(storage, fileKey, fileCache);
  }

  const currentBytes = (await storage.get<number>("currentBytes")) || 0;
  await storage.put("currentBytes", currentBytes + delta);

  return { space: spaceStats };
}
