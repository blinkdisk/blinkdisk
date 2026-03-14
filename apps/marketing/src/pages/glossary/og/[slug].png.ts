import {
  createOgImageResponse,
  generateOgImage,
} from "@marketing/utils/og-image";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const getStaticPaths: GetStaticPaths = async () => {
  const terms = await getCollection("glossary", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return terms.map((term) => ({
    params: { slug: term.data.slug },
    props: { question: term.data.question, summary: term.data.summary },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { question, summary } = props as { question: string; summary: string };

  const png = await generateOgImage({
    title: question,
    description: summary,
    badge: "Glossary",
  });
  return createOgImageResponse(png);
};
