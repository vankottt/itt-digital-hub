import type { ReactNode } from "react";
import { AiActSessionProvider } from "@/components/ai-act-agent/AiActSessionProvider";

export default function AiActAgentLayout({ children }: { children: ReactNode }) {
  return <AiActSessionProvider>{children}</AiActSessionProvider>;
}
