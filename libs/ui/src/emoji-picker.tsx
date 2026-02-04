"use client";

import { useAppTranslation } from "@hooks/use-app-translation";
import { Input } from "@ui/input";
import { Loader } from "@ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import {
  EmojiPickerListCategoryHeaderProps,
  EmojiPickerListEmojiProps,
  Locale,
  EmojiPicker as Picker,
} from "frimousse";
import { useState } from "react";
import { parse } from "twemoji-parser";

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
  const { t } = useAppTranslation("folder.emojiPicker");

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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
            <Picker.Search value={search} className="hidden" />
            <Input
              className="z-10 mx-2 mt-2 w-auto"
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Picker.Viewport className="outline-hidden relative flex-1">
              <Picker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                <Loader />
              </Picker.Loading>
              <Picker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                {t("empty")}
              </Picker.Empty>
              <Picker.List
                className="select-none pb-1.5"
                components={{
                  CategoryHeader: ({
                    category,
                    ...props
                  }: EmojiPickerListCategoryHeaderProps) => (
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
                  Emoji: (props: EmojiPickerListEmojiProps) => {
                    const parsed = parse(props.emoji.emoji);
                    const url = parsed[0]?.url;
                    return (
                      <button
                        className="flex items-start justify-center rounded-md p-1.5 text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
                        {...props}
                      >
                        {url ? (
                          <img src={url} alt={props.emoji.emoji} className="size-5" />
                        ) : (
                          <span className="size-5">{props.emoji.emoji}</span>
                        )}
                      </button>
                    );
                  },
                }}
              />
            </Picker.Viewport>
          </Picker.Root>
        </PopoverContent>
      </Popover>
    </>
  );
}
