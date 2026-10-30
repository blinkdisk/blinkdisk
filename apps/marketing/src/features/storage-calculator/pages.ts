import type { CalculatorPage } from "@marketing/features/storage-calculator/types";

export const CALCULATOR_PAGES = {
  backup: {
    path: "/tool/backup-storage-calculator",
    title: "Cloud Backup Storage Cost Calculator",
    heading: "Compare cloud storage costs for your backups",
    description:
      "Free cloud backup storage calculator. Enter how much data you store and download, and compare what each provider would charge, including download and request fees.",
    introduction:
      "The price per terabyte is only part of the bill. Download fees, request charges and minimums add up. Enter your numbers to see what each provider would actually charge.",
    sections: [
      {
        title: "Enter the size of your backup, not your drive",
        text: "Data stored is the space your backup takes up in the cloud, which is rarely the same as the files on your computer. Compression and deduplication shrink it, and keeping old versions makes it grow. If you already have a backup, use its current size. If not, make a rough guess. The calculator won’t estimate it for you.",
      },
      {
        title: "Storing is cheap. Getting it back might not be.",
        text: "Restores and backup checks both download data. Some providers charge for the transfer, some add a separate retrieval fee, and some cap how much you can download. Set downloads per month to match how often you expect to restore, then open a provider’s details to see which rules apply.",
      },
      {
        title: "Only storage you can access right away",
        text: "Every offer here lets you read your data immediately. That includes cheaper tiers for rarely used data, like Glacier Instant Retrieval, which charges extra when you read from it. Tiers that make you wait hours for a restore, like Glacier Deep Archive, aren’t included.",
      },
      {
        title: "What does 3 TB of backup storage cost?",
        text: "The default numbers assume you upload 3 TB once, keep it for 12 months and download 2 TB each month, with yearly billing where a provider offers it. Change them to match your setup. If you’re planning a big restore, enter the amount you expect to download per month. The calculator repeats it for every month in the period.",
      },
    ],
    faqs: [
      {
        question: "Does this compare backup apps or cloud storage?",
        answer:
          "Cloud storage. For most providers you need your own account plus separate backup software. CloudBlink is the exception: it’s managed storage that only works with BlinkDisk. The estimates for other providers don’t include software subscriptions, gateways or admin time.",
      },
      {
        question:
          "Why isn’t the cheapest price per TB always the cheapest total?",
        answer:
          "Because the per-TB price leaves a lot out. Minimum monthly charges, fixed plan sizes, download and retrieval fees and request charges all change the total. A small backup can still hit a provider’s minimum bill, and an annual plan can charge you for months you don’t use.",
      },
      {
        question: "Can I use this for restic, Kopia or other backup tools?",
        answer:
          "Yes. The calculator doesn’t assume a specific backup app. Enter the size of your repository and how much you download, then check that your backup tool supports the provider. Object size, under Advanced, means the size of the files your backup tool writes to the cloud, not the files on your computer.",
      },
      {
        question: "Does this include the cost of keeping old backup versions?",
        answer:
          "Only if you include them in the amount you enter. The calculator uploads that amount once and keeps it the same for the whole period. It doesn’t simulate daily changes, retention schedules or deduplication.",
      },
    ],
  },
  s3: {
    path: "/tool/s3-storage-calculator",
    title: "S3-Compatible Storage Cost Calculator",
    heading: "Compare S3 storage costs beyond the price per TB",
    description:
      "Compare S3-compatible object storage pricing. Enter your data volume, downloads and object size to see storage, egress, retrieval and request costs for each provider.",
    introduction:
      "Storage, egress and API requests all end up on the same invoice. Enter your workload to see the total for each S3-compatible provider, then open any row to see how we got there.",
    sections: [
      {
        title: "Small objects mean more requests",
        text: "The same terabyte needs more requests when it’s split into many small objects. That can raise the bill if the provider charges for those requests; some include them for free. The calculator counts one write per object on upload and one read per object downloaded. For example, 1 TB of 20 MB objects is about 50,000 writes. Listing, HEAD requests, retries and multipart overhead aren’t counted.",
      },
      {
        title: "Egress and retrieval are two different fees",
        text: "Egress is what you pay to send data out to the internet. Retrieval is an extra charge some storage classes add for reading data at all. One download can trigger both, plus read requests. Free allowances are applied monthly, assuming nothing else on your account uses them.",
      },
      {
        title: "S3-compatible doesn’t mean identical",
        text: "We only list providers whose documentation confirms S3 API support or compatibility. Features like Object Lock, versioning, checksums and authentication still vary, so check the linked docs before you commit. Google Cloud is included through its XML API compatibility mode. Native Azure Blob storage and CloudBlink aren’t on this page.",
      },
      {
        title: "Price your workload, not the headline rate",
        text: "Start with how much data you keep, then add monthly downloads and average object size. Leave the duration at 12 months for a yearly budget, or shorten it to see how minimum retention periods and annual commitments affect short-term use. The calculator assumes one upload and a constant amount of data, so it’s not a good fit for apps whose data changes all the time.",
      },
    ],
    faqs: [
      {
        question: "What costs does this S3 calculator include?",
        answer:
          "Storage, the initial upload (processing fees and write requests), monthly downloads (egress and read requests), retrieval fees, minimum bills and required storage commitments. Each offer’s details show the reference region and billing rules we used. Taxes, replication, optional services and negotiated discounts aren’t included.",
      },
      {
        question: "Why does average object size matter?",
        answer:
          "It decides how many objects and requests the estimate assumes. Some providers also bill very small objects as if they were larger, which raises the storage bill. The calculator treats every object as average-sized, so a real mix of sizes can cost more or less.",
      },
      {
        question: "Does the calculator use GB or GiB?",
        answer:
          "You enter decimal units, so 1 TB is 1,000 GB. If a provider bills in binary GiB, we convert before applying their price. Each offer’s details list its billing unit.",
      },
      {
        question: "Why are some offers outside this scenario?",
        answer:
          "Every offer has a published price, but not every price covers every workload. If your storage, object count or downloads go past a provider’s plans, usage policy or public rate card, we can’t give an honest estimate. Those offers move to the bottom of the list, and their details explain which limit you hit.",
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
    sections: { title: string; text: string }[];
    faqs: { question: string; answer: string }[];
  }
>;
