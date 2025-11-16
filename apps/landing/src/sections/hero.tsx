import { useIsMobile } from "@hooks/use-mobile";
import { useTheme } from "@hooks/use-theme";
import { GithubIcon } from "@landing/components/icons/github";
import { Button } from "@ui/button";
import { SplitText } from "@ui/split-text";
import { motion } from "framer-motion";
import { DownloadIcon } from "lucide-react";

export function Hero() {
  const mobile = useIsMobile();
  const { dark } = useTheme();

  return (
    <div className="pt-page flex flex-col items-center justify-center pb-16 sm:pb-24">
      <div className="flex max-w-[90vw] flex-col items-center text-center md:max-w-[38rem]">
        <h1 className="mt-4 text-5xl text-[2.5rem] font-bold leading-tight tracking-tight md:text-6xl">
          <SplitText>Secure your files</SplitText>
          <br className="hidden sm:block" />
          <SplitText delay={0.2}>before it's too late</SplitText>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: "2rem" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.5 }}
          className="text-muted-foreground mt-4 text-base sm:mt-6 sm:text-lg md:text-xl md:leading-relaxed"
        >
          BlinkDisk is a desktop application that lets you effortlessly create
          backup copies of all your important files
          <span className="hidden sm:inline"> with just a few clicks</span>.
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
        className="lg:rounded-4xl w-content mt-16 rounded-xl border shadow sm:mt-20 sm:rounded-2xl md:rounded-3xl"
      />
    </div>
  );
}
