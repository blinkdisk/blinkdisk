import { useIsMobile } from "@hooks/use-mobile";
import { GithubIcon } from "@landing/components/icons/github";
import { useTheme } from "@landing/hooks/use-theme";
import { Button } from "@ui/button";
import { Dialog, DialogContent } from "@ui/dialog";
import { SplitText } from "@ui/split-text";
import { motion } from "framer-motion";
import { DownloadIcon, PlayIcon } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const mobile = useIsMobile();
  const { dark } = useTheme();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="pt-page flex flex-col items-center justify-center pb-16 sm:pb-24">
      <div className="flex max-w-[90vw] flex-col items-center text-center md:max-w-[38rem]">
        <h1 className="mt-4 text-5xl text-[2.5rem] font-bold leading-tight tracking-tight md:text-6xl">
          <SplitText>Secure your files</SplitText>
          <br className="hidden sm:block" />
          <SplitText delay={0.2}>before it&apos;s too late</SplitText>
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
      <motion.div
        initial={{ opacity: 0, y: "5rem", scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, delay: 1 }}
        className="lg:rounded-4xl relative mt-16 cursor-pointer overflow-hidden rounded-xl sm:mt-20 sm:rounded-2xl md:rounded-3xl"
        onClick={() => setVideoOpen(true)}
      >
        <img
          src={`/screenshots/${dark ? "dark" : "light"}.png`}
          alt="Screenshot of the BlinkDisk desktop app"
          className="w-content border shadow"
        />
        <div className="group absolute inset-0 flex items-center justify-center bg-opacity-0 transition-colors hover:bg-black/10">
          <div className="bg-foreground/20 border-foreground/20 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-2xl transition-transform group-hover:scale-110">
            <PlayIcon
              fill="currentColor"
              className="text-foreground ml-1 h-8 w-8"
            />
          </div>
        </div>
      </motion.div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          style={{ zIndex: 1004 }}
          overlayStyle={{ zIndex: 1003 }}
          className="max-w-[90vw] overflow-hidden border-0 bg-transparent p-0 shadow-none xl:!max-w-6xl"
          showCloseButton={false}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl md:!rounded-2xl">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/wAKE0aHJptM?autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
