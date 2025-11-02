import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "lucide-react";
import Markdown from "react-markdown";

const faqs = [
  {
    question: "Do I need to be tech-savvy to use BlinkDisk?",
    answer:
      "Not at all! BlinkDisk was built for everyone. Just install it, pick what you want to protect, and it quietly takes care of the rest.",
  },
  {
    question: "Where do my backups actually go?",
    answer:
      "That’s completely up to you. You can use BlinkDisk Cloud for a hassle-free setup, or connect your own storage like an external drive, NAS, or S3 bucket.",
  },
  {
    question: "Can anyone see the files I’m backing up?",
    answer:
      "Nope. Your files are encrypted right on your device before they’re uploaded. Only you have the key, not even we can access them.",
  },
  {
    question: "How’s this different from OneDrive or iCloud?",
    answer:
      "Those services sync your files. If you delete or overwrite something, it’s gone there too. BlinkDisk creates real backups, so you can restore older versions anytime.",
  },
  {
    question: "What if my computer crashes or gets stolen?",
    answer:
      "No worries. Just install BlinkDisk on a new device, connect your storage, and everything comes back. Your backups stay safe and encrypted no matter what happens.",
  },
];

export function Faq() {
  return (
    <section
      id="faqs"
      className="md:!w-2xl w-content mx-auto pb-32 pt-16 sm:pb-40 sm:pt-24"
    >
      <div className="flex flex-col items-center text-center">
        <h2 className="text-center text-4xl font-bold sm:text-5xl">
          Questions & Answers
        </h2>
      </div>
      <p className="text-muted-foreground mt-4 text-center">
        Still have questions? Here are answers to some frequently asked
        questions.
      </p>
      <dl className="mt-6 flex flex-col gap-2 sm:mt-16 sm:gap-4">
        {faqs.map((faq, index) => (
          <div key={faq.question}>
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
          </div>
        ))}
      </dl>
    </section>
  );
}
