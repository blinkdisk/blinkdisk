import type { ComponentProps } from "react";
import Markdown from "react-markdown";

type LegalClientProps = {
  children: string;
};

function childrenToId(children: React.ReactNode) {
  const slugified = children
    ?.toString()
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/,/gm, "");
  const parts = slugified?.split(".-");
  if ((parts?.length || 0) > 1) return parts?.slice(1).join(".");
  return slugified;
}

export default function LegalClient({ children }: LegalClientProps) {
  return (
    <div className="py-page flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      <article className="prose dark:prose-invert md:prose-md max-w-[90vw] md:!max-w-[40rem]">
        <Markdown
          components={{
            h1: ({
              node,
              ...props
            }: ComponentProps<"h1"> & { node?: unknown }) => (
              <h1 id={childrenToId(props.children)} {...props} />
            ),
            h2: ({
              node,
              ...props
            }: ComponentProps<"h2"> & { node?: unknown }) => (
              <h2
                className="scroll-mt-32"
                id={childrenToId(props.children)}
                {...props}
              />
            ),
            h3: ({
              node,
              ...props
            }: ComponentProps<"h3"> & { node?: unknown }) => (
              <h3
                className="scroll-mt-32"
                id={childrenToId(props.children)}
                {...props}
              />
            ),
          }}
        >
          {children}
        </Markdown>
      </article>
      <div className="mb-auto"></div>
    </div>
  );
}
