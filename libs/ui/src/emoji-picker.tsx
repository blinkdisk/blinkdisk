"use client";

import { Loader } from "@ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Locale, EmojiPicker as Picker } from "frimousse";
import { useState } from "react";
import Twemoji from "react-twemoji";

export type EmojiPickerProps = {
  locale: string;
  children?: React.ReactNode;
  onEmojiSelect?: (emoji: string) => void;
};

const supportedLocales = [
  "bn",
  "da",
  "de",
  "en-gb",
  "en",
  "es-mx",
  "es",
  "et",
  "fi",
  "fr",
  "hi",
  "hu",
  "it",
  "ja",
  "ko",
  "lt",
  "ms",
  "nb",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "th",
  "uk",
  "vi",
  "zh-hant",
  "zh",
];

export function EmojiPicker({
  locale,
  children,
  onEmojiSelect,
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Popover onOpenChange={setIsOpen} open={isOpen} modal>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-fit overflow-hidden rounded-xl p-0">
          <Picker.Root
            onEmojiSelect={({ emoji }) => onEmojiSelect?.(emoji)}
            className="flex h-[368px] w-fit flex-col bg-white dark:bg-neutral-900"
            locale={
              supportedLocales.includes(locale) ? (locale as Locale) : "en"
            }
          >
            <Picker.Viewport className="outline-hidden relative flex-1">
              <Picker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                <Loader />
              </Picker.Loading>
              <Picker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                No emoji found.
              </Picker.Empty>
              <Picker.List
                className="select-none pb-1.5"
                components={{
                  CategoryHeader: ({ category, ...props }) => (
                    <div
                      className="bg-white px-3 pb-1.5 pt-3 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                      {...props}
                    >
                      {category.label}
                    </div>
                  ),
                  Row: ({ children, ...props }) => (
                    <div className="scroll-my-1.5 px-1.5" {...props}>
                      {children}
                    </div>
                  ),
                  Emoji: ({ emoji, ...props }) => (
                    <button
                      className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
                      {...props}
                    >
                      <Twemoji
                        options={{
                          className: "size-5",
                        }}
                      >
                        {emoji.emoji}
                      </Twemoji>
                    </button>
                  ),
                }}
              />
            </Picker.Viewport>
          </Picker.Root>
        </PopoverContent>
      </Popover>
    </>
  );
}
