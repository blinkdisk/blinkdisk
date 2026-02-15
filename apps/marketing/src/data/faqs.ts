export const faqs = [
  {
    question: "Do I need to be tech-savvy to use BlinkDisk?",
    answer:
      "Not at all! BlinkDisk was built for everyone. Just install it, pick what you want to protect, and it quietly takes care of the rest.",
  },
  {
    question: "Where do my backups actually go?",
    answer:
      "That's completely up to you. You can use CloudBlink for a hassle-free setup, or connect your own storage like an external drive, NAS, or S3 bucket.",
  },
  {
    question: "Can anyone see the files I'm backing up?",
    answer:
      "Nope. Your files are encrypted right on your device before they're uploaded. Only you have the key, not even we can access them.",
  },
  {
    question: "How's this different from OneDrive or iCloud?",
    answer:
      "Those services sync your files. If you delete or overwrite something, it's gone there too. BlinkDisk creates real backups, so you can restore older versions anytime.",
  },
  {
    question: "What if my computer crashes or gets stolen?",
    answer:
      "No worries. Just install BlinkDisk on a new device, connect your storage, and everything comes back. Your backups stay safe and encrypted no matter what happens.",
  },
];

export function getFaqStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
