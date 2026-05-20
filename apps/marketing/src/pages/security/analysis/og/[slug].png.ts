import { getCollection } from "astro:content";
import {
  createOgImageResponse,
  generateSecurityAnalysisOgImage,
} from "@marketing/utils/og-image";
import type { APIRoute, GetStaticPaths } from "astro";

type SecurityAnalysisOgProps = {
  title: string;
  description: string;
  severity: string;
  cvssScore: number;
  cveId: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const analyses = await getCollection("security", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return analyses.map((analysis) => ({
    params: { slug: analysis.id },
    props: {
      title: analysis.data.title,
      description: analysis.data.description,
      severity: analysis.data.severity,
      cvssScore: analysis.data.cvssScore,
      cveId: analysis.data.cveId,
    } satisfies SecurityAnalysisOgProps,
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, severity, cvssScore, cveId } =
    props as SecurityAnalysisOgProps;

  const png = await generateSecurityAnalysisOgImage({
    title,
    description,
    severity,
    cvssScore,
    cveId,
  });
  return createOgImageResponse(png);
};
