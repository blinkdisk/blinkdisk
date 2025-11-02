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

let running = false;

export function EncryptionAnimation() {
  const [encrypted, setEncrypted] = useState(false);

  const [encryptedText, setEncryptedText] = useState(originalText);
  const [decryptedText, setDecryptedText] = useState(originalText);

  useEffect(() => {
    if (running) return;
    running = true;
    start();
  }, []);

  async function start() {
    while (true) {
      await animate();
    }
  }

  async function animate() {
    const pool =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=-?";

    let decryptedText = originalText;
    let encryptedText = "";

    setDecryptedText(decryptedText);
    setEncryptedText(encryptedText);

    // slowly replace each character with a random special character from the pool
    for (let i = 0; i < originalText.length; i++) {
      const originalChar = originalText[i];

      if (originalChar === "\n") await sleep(100);

      const randomChar =
        originalChar === "\n"
          ? "\n"
          : pool[Math.floor(Math.random() * pool.length)];

      encryptedText += randomChar;
      decryptedText = originalText.slice(i + 1);

      setDecryptedText(decryptedText);
      setEncryptedText(encryptedText);

      await sleep(30 * Math.random() + 10);
    }

    setEncrypted(true);
    await sleep(1500);
    setEncrypted(false);

    for (let i = originalText.length - 1; i >= 0; i--) {
      if (originalText[i] === "\n") await sleep(100);

      encryptedText = encryptedText.slice(0, i);
      decryptedText = originalText.slice(i);

      setDecryptedText(decryptedText);
      setEncryptedText(encryptedText);

      await sleep(30 * Math.random() + 10);
    }

    await sleep(1500);
  }

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
      <p className="space-mono whitespace-pre text-base/7">
        <span className="text-muted-foreground">{encryptedText}</span>
        {encryptedText.length !== originalText.length &&
        encryptedText.length !== 0 ? (
          <span className="relative">
            <div className="border-primary absolute left-0 top-0 h-6 border-l-2 shadow-[0_0_10px_var(--primary)]"></div>
          </span>
        ) : null}
        {decryptedText}
      </p>
    </div>
  );
}
