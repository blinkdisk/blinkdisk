import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useIsMobile } from "@hooks/use-mobile";
import { useTheme } from "@hooks/use-theme";
import { GithubIcon } from "@landing/components/icons/github";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { SplitText } from "@ui/split-text";
import { cn } from "@utils/class";
import { motion } from "framer-motion";
import {
  CloudIcon,
  DownloadIcon,
  GlobeIcon,
  MinusIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  UserCheckIcon,
} from "lucide-react";
import Markdown from "react-markdown";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Bento />
      <Faq />
    </>
  );
}

function Hero() {
  const mobile = useIsMobile();
  const { dark } = useTheme();

  return (
    <div className="pt-page flex flex-col items-center justify-center">
      <div className="flex max-w-[90vw] flex-col items-center text-center md:max-w-[42rem]">
        <h1 className="mt-4 text-5xl text-[2.5rem] font-bold leading-tight tracking-tight md:text-6xl">
          <SplitText>Backup takes minutes,</SplitText>
          <br className="hidden md:block" />
          <SplitText delay={0.2}>but regret lasts forever.</SplitText>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: "2rem" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.5 }}
          className="text-muted-foreground mt-4 text-base sm:mt-6 sm:text-lg md:text-xl md:leading-relaxed"
        >
          BlinkDisk is a modern desktop app that lets you back up all your
          important files. Just takes a few clicks, no tech skills needed.
        </motion.p>
        <div className="mt-8 flex items-center gap-3 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: "2rem" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.8 }}
          >
            <Button
              as="a"
              href="https://github.com/blinkdisk/blinkdisk"
              target="_blank"
              size={mobile ? "icon-lg" : "icon-xl"}
              variant="outline"
            >
              <GithubIcon />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: "2rem" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.65 }}
            className="w-full md:w-auto"
          >
            <Button
              as="link"
              to="/download"
              className="w-full md:w-auto"
              size={mobile ? "lg" : "xl"}
            >
              <DownloadIcon className="mr-1.5" />
              Download App
            </Button>
          </motion.div>
        </div>
      </div>
      <motion.img
        initial={{ opacity: 0, y: "5rem", scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, delay: 1 }}
        src={`/screenshots/${dark ? "dark" : "light"}.png`}
        className="border-background border-6 lg:rounded-4xl w-content mt-16 rounded-xl shadow sm:mt-20 sm:rounded-2xl md:rounded-3xl"
      />
    </div>
  );
}

const features = [
  {
    subTitle: "End-to-End Encrypted",
    title: "Your files, your eyes only.",
    description:
      "All backups are encrypted before they ever leave your device. Not even we can read your data, and that's how it should be.",
    icon: ShieldIcon,
  },
  {
    subTitle: "User-Friendly",
    title: "No manuals, no clutter.",
    description:
      "BlinkDisk is built to feel invisible. Set it up once, and it quietly backs up your files in the background. No distractions, no decisions.",
    icon: UserCheckIcon,
  },
  {
    subTitle: "Simple Setup",
    title: "Get started in minutes.",
    icon: SettingsIcon,
    description:
      "No tech stills needed. BlinkDisk works out of the box, whether you're bringing your own S3 keys or using BlinkDisk Cloud.",
  },
  {
    subTitle: "Fair Source",
    title: "Built in the open. Yours to inspect.",
    description:
      "BlinkDisk is built in the open, giving you full transparency and control. Auditable, community-driven technology you can trust.",
    icon: GithubIcon,
  },
  {
    subTitle: "Cross-Platform",
    title: "Backup from anywhere.",
    icon: GlobeIcon,
    description:
      "Whether you're on macOS, Windows, or Linux, BlinkDisk keeps your files safe and synced seamlessly across all your machines.",
  },
  {
    subTitle: "BlinkDisk Cloud",
    title: "Cloud Storage included.",
    icon: CloudIcon,
    description:
      "Secure  cloud storage, built right in. Prefer your own setup? Bring your own cloud provider keys. Your data, your control.",
  },
];

function Bento() {
  return (
    <section id="features" className="mt-24 w-full sm:!mt-48">
      <div className="w-content mx-auto">
        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={cn(
                `bg-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8`,
                index === 0 || index === 3 || index === 4
                  ? "md:col-span-7"
                  : "md:col-span-5",
                index === 0 && "md:rounded-tl-[2rem]",
                index === 1 && "md:rounded-tr-[2rem]",
                index === 4 && "md:rounded-bl-[2rem]",
                index === 5 && "md:rounded-br-[2rem]",
              )}
              variants={{
                hidden: { opacity: 0, y: "4rem" },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                ease: "easeOut",
              }}
            >
              <div className="bg-primary/10 border-primary/20 flex size-12 items-center justify-center rounded-xl border-2">
                {<feature.icon className="text-primary" />}
              </div>
              <div className="flex flex-col">
                <h3 className="text-muted-foreground mt-8 text-sm font-semibold">
                  {feature.subTitle}
                </h3>
                <p className="mt-1 text-xl font-semibold">{feature.title}</p>
                <p className="mt-2 text-sm text-gray-500 md:text-base dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              {/* 
                <div className="flex w-full grow items-center justify-center rounded-lg">
                  {feature.icon}
                </div>
              */}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  {
    question: "Can BlinkDisk see my files?",
    answer:
      "No. With end-to-end encryption, only you hold the keys. BlinkDisk (and even BlinkDisk Cloud) cannot access or decrypt your data.",
  },
  {
    question: "What is BlinkDisk Cloud?",
    answer:
      "BlinkDisk Cloud is our fully managed backup storage service, integrated directly into the app. If you prefer, you can also bring your own storage by entering your own cloud credentials.",
  },
  {
    question: "How much does BlinkDisk cost?",
    answer:
      "For BlinkDisk Cloud, you can see all plans on our [pricing page](/pricing). If you prefer, you can also bring your own storage by connecting your own cloud credentials. This option is completely free to use, but requires some manual setup.",
  },
  {
    question: "Is BlinkDisk open source?",
    answer:
      "BlinkDisk follows a fair source model, which is very similiar to open source. This means you’ll be able to read and modify the source code, but there are limitations on using the source code for commercial use. We’re planning to license it under FSL-1.1-ALv2, a modern Fair Source License that balances transparency with sustainable development.",
  },
  {
    question: "Where can I find the source code?",
    answer:
      "You can find the BlinkDisk source code on [GitHub](https://github.com/blinkdisk/blinkdisk).",
  },
];

export function Faq() {
  return (
    <motion.section
      id="faqs"
      variants={{
        hidden: {},
        shown: {},
      }}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true }}
      className="md:!w-2xl w-content mx-auto my-24 px-6 sm:my-48"
    >
      <div className="flex flex-col items-center text-center">
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: "2rem" },
            shown: { opacity: 1, y: "0rem" },
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-center text-3xl font-bold tracking-tighter sm:text-[3rem] sm:leading-[3rem]"
        >
          Questions & Answers
        </motion.h2>
      </div>
      <dl className="mt-6 flex flex-col gap-2 sm:mt-16 sm:gap-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.question}
            variants={{
              hidden: { opacity: 0, y: "1.5rem" },
              shown: { opacity: 1, y: "0rem" },
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: 0.2 + 0.1 * index,
            }}
          >
            <Disclosure as="div" key={faq.question} className="pt-6">
              {({ open }) => (
                <>
                  <dt>
                    <DisclosureButton className="text-foreground flex w-full cursor-pointer items-start justify-between text-left">
                      <p className="text-sm font-medium leading-7 sm:text-base">
                        {faq.question}
                      </p>
                      <div className="ml-6 flex h-7 items-center">
                        {open ? (
                          <MinusIcon
                            className="h-6 w-6 stroke-[1]"
                            aria-hidden="true"
                          />
                        ) : (
                          <PlusIcon
                            className="h-6 w-6 stroke-1"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </DisclosureButton>
                  </dt>
                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    <p className="text-foreground/80 [&_a]:text-primary text-sm leading-7 sm:text-base">
                      <Markdown>{faq.answer}</Markdown>
                    </p>
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </motion.div>
        ))}
      </dl>
    </motion.section>
  );
}
