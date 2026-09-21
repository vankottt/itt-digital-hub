import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "@/settlement-analyzer/styles.css";

export default function SettlementAnalyzerLayout({ children }: { children: ReactNode }) {
  return <div className="sa-root">{children}</div>;
}
