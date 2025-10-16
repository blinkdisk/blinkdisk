export function head({
  title,
  description,
  og,
}: {
  title: string;
  description: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
  };
}) {
  const titleWithName = `${title} | BlinkDisk`;

  return () => ({
    meta: [
      {
        title: titleWithName,
      },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: og?.title || titleWithName,
      },
      {
        property: "og:description",
        content: og?.description || description,
      },
      {
        property: "twitter:title",
        content: og?.title || titleWithName,
      },
      {
        property: "twitter:description",
        content: og?.description || description,
      },
      ...(og?.image
        ? [
            {
              property: "og:image",
              content: `${process.env.LANDING_URL}${og.image}`,
            },
            {
              property: "twitter:image",
              content: `${process.env.LANDING_URL}${og.image}`,
            },
          ]
        : []),
    ],
  });
}
