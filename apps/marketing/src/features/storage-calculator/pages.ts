import type { CalculatorPage } from "@marketing/features/storage-calculator/types";

export const CALCULATOR_PAGES = {
  backup: {
    path: "/tool/backup-storage-calculator",
    title: "Cloud Backup Storage Cost Calculator",
    heading: "Find the right cloud storage for your backups",
    description:
      "Compare cloud backup storage costs across providers. Estimate storage, downloads and request fees with transparent pricing for backups and immediately accessible archives.",
    introduction:
      "A small price per terabyte doesn’t always mean a small bill. Compare storage, downloads and request costs for your backup or archive, all in one place.",
    otherLabel: "Compare S3-compatible storage instead",
    otherPath: "/tool/s3-storage-calculator",
    sections: [
      {
        title: "Start with the size of your backup, not your computer",
        text: "The data stored field means the space your backup repository occupies in the cloud. It is not necessarily the size of the files you want to protect. Compression and deduplication may reduce it, while retained versions and changed files may increase it. Enter your repository’s actual or estimated stored size; this calculator does not predict it for you.",
      },
      {
        title: "Cheap to keep. What does it cost to get back?",
        text: "Set monthly downloads to see the impact of restores and verification reads. Download traffic can carry both an internet transfer charge and a separate retrieval fee. Some services include an allowance; others limit how much you can download under their standard policy. Open a provider’s details to see what applies.",
      },
      {
        title: "An archive you can access immediately",
        text: "These estimates cover immediately accessible storage, including storage used for infrequently read backups and archives. Glacier Instant Retrieval is included because it provides immediate access, with additional retrieval charges. Delayed-retrieval classes such as Glacier Deep Archive are outside this comparison.",
      },
      {
        title: "What does 1 TB of backup storage cost?",
        text: "The default scenario keeps 1 TB in storage for 12 months after one upload, without downloads. Change the storage amount to match your repository and add a realistic download allowance. For a restore-heavy period, enter the volume you expect to download each month; the same volume is repeated across the selected period.",
      },
    ],
    faqs: [
      {
        question: "Does this compare backup apps or cloud storage?",
        answer:
          "It compares cloud storage offers. Most require separate backup software and your own provider account. CloudBlink is managed storage used exclusively with BlinkDisk. Software subscriptions, gateway infrastructure and administration costs are not added to other providers’ storage estimates.",
      },
      {
        question:
          "Why is the cheapest price per TB not always the cheapest total?",
        answer:
          "Minimum charges, capacity bundles, download fees, retrieval charges and request prices can change the total. A small repository can still incur a full minimum monthly charge. Annual packages may require paying for more months than you plan to use.",
      },
      {
        question: "Can I use this for restic, Kopia or other backup tools?",
        answer:
          "Yes. The cost model does not assume a particular backup app. Enter the stored repository size and downloads for your workflow, and check the provider’s API and feature support with your chosen software. Object size refers to cloud objects written by the app, not necessarily your original files.",
      },
      {
        question: "Does this include the cost of keeping old backup versions?",
        answer:
          "Only if their storage is included in the amount you enter. The model keeps that total constant and uploads it once. It does not simulate incremental backups, retention schedules, daily changes or deduplication.",
      },
    ],
  },
  s3: {
    path: "/tool/s3-storage-calculator",
    title: "S3-Compatible Storage Cost Calculator",
    heading: "Compare S3 storage beyond the price per TB",
    description:
      "Compare S3-compatible object storage pricing. Calculate storage, egress, retrieval and request costs using data volume, duration and average object size.",
    introduction:
      "Put storage, egress and API requests on the same bill. Estimate what your workload costs across S3-compatible providers, with the assumptions out in the open.",
    otherLabel: "Compare cloud storage for backups instead",
    otherPath: "/tool/backup-storage-calculator",
    sections: [
      {
        title: "Object size changes the request bill",
        text: "One terabyte split into small objects requires many more operations than the same volume in large objects. This calculator estimates one write per initial object and one read per downloaded object. For example, 1 TB in 20 MB objects is about 50,000 initial writes. Listing, HEAD requests, retries and multipart overhead are not included.",
      },
      {
        title: "Egress and retrieval are different charges",
        text: "Egress is data transferred out of the provider to the internet. Retrieval is a separate charge for reading data from certain storage classes. A download can incur both, plus read-request charges. Allowances are applied monthly and are assumed not to be consumed by your other workloads.",
      },
      {
        title: "S3-compatible does not mean feature-identical",
        text: "This page includes only offers with provider documentation establishing S3 API support or documented interoperability. Check the linked API documentation for features such as Object Lock, versioning, checksums and authentication. Google Cloud uses its documented XML API interoperability mode. Native Azure Blob storage and CloudBlink are not included.",
      },
      {
        title: "Compare a workload, not a headline rate",
        text: "Start with the amount of data kept in storage, then set downloads and average object size. Keep the duration at 12 months for an annual budget, or shorten it to explore minimum retention and annual commitments. This model is for one initial upload and a constant volume; it does not model a continuously changing application.",
      },
    ],
    faqs: [
      {
        question: "What costs does this S3 calculator include?",
        answer:
          "For priced offers it models storage, initial upload transfer and write requests, recurring internet downloads and read requests, retrieval charges, minimum bills and required storage commitments. Details show the selected reference region and billing rules. Taxes, replication, optional services and negotiated discounts are excluded.",
      },
      {
        question: "Why does average object size matter?",
        answer:
          "It determines estimated object and request counts. Providers may also bill tiny objects at a minimum size, increasing billable storage. The estimate treats the average size as representative; a real distribution of mixed object sizes can produce different costs.",
      },
      {
        question: "Does the calculator use GB or GiB?",
        answer:
          "Your inputs use decimal GB and TB: 1 TB equals 1,000 GB. When a provider bills in binary GiB, the calculation converts bytes before applying its rate. The billing unit is listed in each priced offer’s details.",
      },
      {
        question: "Why are some providers not estimated?",
        answer:
          "A trustworthy total needs more than a storage rate. Offers with incomplete verified pricing, configuration-dependent fees or workloads outside their standard usage policy remain visible without a price. Open their details for the reason and official sources.",
      },
    ],
  },
} satisfies Record<
  CalculatorPage,
  {
    path: string;
    title: string;
    heading: string;
    description: string;
    introduction: string;
    otherLabel: string;
    otherPath: string;
    sections: { title: string; text: string }[];
    faqs: { question: string; answer: string }[];
  }
>;
