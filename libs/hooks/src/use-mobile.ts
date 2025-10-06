import { useMediaQuery } from "usehooks-ts";

export function useIsMobile() {
  const media = useMediaQuery("(max-width: 768px)");

  return media;
}
