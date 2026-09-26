import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AiActSessionProvider } from "@/components/ai-act-agent/AiActSessionProvider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AiActAgentLayout({ children }: { children: ReactNode }) {
  return <AiActSessionProvider>{children}</AiActSessionProvider>;
}
