import { ChatboxColors, Crisp as crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export function Chatbox() {
  useEffect(() => {
    if (!process.env.CRISP_KEY) return;

    crisp.configure(process.env.CRISP_KEY!);
    crisp.setColorTheme(ChatboxColors.Indigo);
  }, []);

  return null;
}
