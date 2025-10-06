import { motion } from "framer-motion";

type SplitTextProps = {
  children: string;
  delay?: number;
};

export function SplitText({ children, delay }: SplitTextProps) {
  const words = children.split(" ").map((word) => word.split(""));

  return (
    <span
      style={{
        overflow: "hidden",
        display: "inline",
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {word.map((letter, letterIndex) => {
            const index =
              words.slice(0, wordIndex).reduce((acc, w) => acc + w.length, 0) +
              letterIndex;

            return (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: "50%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{
                  delay: (delay || 0) + index * 0.01,
                  ease: "easeOut",
                }}
                style={{
                  display: "inline-block",
                  willChange: "transform, opacity",
                }}
              >
                {letter}
              </motion.span>
            );
          })}
          <span style={{ display: "inline-block", width: "0.3em" }}>
            &nbsp;
          </span>
        </span>
      ))}
    </span>
  );
}
