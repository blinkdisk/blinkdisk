export function head({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return () => ({
    meta: [
      {
        title: `${title} | BlinkDisk`,
      },
      {
        name: "description",
        content: description,
      },
    ],
  });
}
