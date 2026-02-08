type GlossaryTerm = {
  term: string;
  slug: string;
  question: string;
  summary: string;
};

function getTermStructuredData(term: GlossaryTerm, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.summary,
    url: `${siteUrl}/glossary/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "BlinkDisk Backup Glossary",
      url: `${siteUrl}/glossary`,
    },
  };
}

function getTermFaqStructuredData(term: GlossaryTerm, fullAnswer: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: term.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: fullAnswer || term.summary,
        },
      },
    ],
  };
}

export function getGlossaryIndexStructuredData(terms: GlossaryTerm[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "BlinkDisk Backup Glossary",
    description: "A comprehensive glossary of backup, storage, and data protection terms.",
    url: `${siteUrl}/glossary`,
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.summary,
      url: `${siteUrl}/glossary/${term.slug}`,
    })),
  };
}

export function getCombinedStructuredData(
  term: GlossaryTerm,
  fullAnswer: string,
  siteUrl: string
) {
  return [
    getTermStructuredData(term, siteUrl),
    getTermFaqStructuredData(term, fullAnswer),
  ];
}

