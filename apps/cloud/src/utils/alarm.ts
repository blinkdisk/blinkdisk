export async function scheduleVaultAlarm(storage: DurableObjectStorage) {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  await storage.setAlarm(date.getTime());
}

export async function scheduleSpaceAlarm(storage: DurableObjectStorage) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  await storage.setAlarm(date.getTime());
}
