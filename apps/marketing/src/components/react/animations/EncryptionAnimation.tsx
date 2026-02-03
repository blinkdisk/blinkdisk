import { cn } from "@utils/class";
import { EyeIcon, FileIcon, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const originalText = `To-Do:
- Download the BlinkDisk app
- Select my important files
- Run the first backup`;

export default function EncryptionAnimation() {
  const [encrypted, setEncrypted] = useState(false);
  const [encryptedText, setEncryptedText] = useState(originalText);
  const [decryptedText, setDecryptedText] = useState(originalText);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    import("@fontsource/space-mono/latin-400.css").then(() => setFontLoaded(true));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function animate() {
      const pool =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=-?";

      let decryptedTextLocal = originalText;
      let encryptedTextLocal = "";

      setDecryptedText(decryptedTextLocal);
      setEncryptedText(encryptedTextLocal);

      for (let i = 0; i < originalText.length && mounted; i++) {
        const originalChar = originalText[i];

        if (originalChar === "\n") await sleep(100);

        const randomChar =
          originalChar === "\n"
            ? "\n"
            : pool[Math.floor(Math.random() * pool.length)];

        encryptedTextLocal += randomChar;
        decryptedTextLocal = originalText.slice(i + 1);

        setDecryptedText(decryptedTextLocal);
        setEncryptedText(encryptedTextLocal);

        await sleep(30 * Math.random() + 10);
      }

      if (!mounted) return;

      setEncrypted(true);
      await sleep(1500);
      if (!mounted) return;
      setEncrypted(false);

      for (let i = originalText.length - 1; i >= 0 && mounted; i--) {
        if (originalText[i] === "\n") await sleep(100);

        encryptedTextLocal = encryptedTextLocal.slice(0, i);
        decryptedTextLocal = originalText.slice(i);

        setDecryptedText(decryptedTextLocal);
        setEncryptedText(encryptedTextLocal);

        await sleep(30 * Math.random() + 10);
      }

      await sleep(1500);
    }

    async function start() {
      while (mounted) {
        await animate();
      }
    }

    start();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col justify-between p-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <FileIcon className="size-4" />
          <span className="text-lg">todo-list.txt</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            encrypted ? "text-primary" : "text-muted-foreground",
          )}
        >
          <p>{encrypted ? "Encrypted" : "Decrypted"}</p>
          {encrypted ? (
            <LockIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </div>
      </div>
      <hr className="w-full border-t" />
      <p
        className="whitespace-pre text-base/7"
        style={{ fontFamily: fontLoaded ? "'Space Mono', monospace" : "monospace" }}
      >
        <span className="text-muted-foreground">{encryptedText}</span>
        {encryptedText.length !== originalText.length &&
        encryptedText.length !== 0 ? (
          <span className="relative">
            <span className="border-primary absolute left-0 top-0 block h-6 border-l-2 shadow-[0_0_10px_var(--primary)]"></span>
          </span>
        ) : null}
        {decryptedText}
      </p>
    </div>
  );
}
