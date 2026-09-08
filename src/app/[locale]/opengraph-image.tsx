import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";

export const alt = "ITT Digital Hub — Applied AI Consultancy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Static Open Graph image per locale: name, descriptor, institutional anchor
 * and the supplied mark. Uses the Cyrillic-capable font files vendored for OG.
 */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const [serif, sans, mark] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og/SourceSerif4-Semibold.woff")),
    readFile(join(process.cwd(), "src/assets/og/IBMPlexSans-Regular.woff")),
    readFile(join(process.cwd(), "public/brand/itt-lockup-compact.png")),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#ffffff",
          color: "#12161c",
          fontFamily: "Plex",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={markSrc} width={280} height={58} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Serif", fontSize: 40, lineHeight: 1.1 }}>{site.name[locale]}</div>
            <div style={{ fontSize: 20, letterSpacing: 2, color: "#6a737d", marginTop: 10 }}>{site.anchorShort[locale].toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: "100%", height: 1, background: "#dedfd8" }} />
          <div style={{ fontFamily: "Serif", fontSize: 44, lineHeight: 1.15, maxWidth: 1000 }}>{site.descriptor[locale]}</div>
          <div style={{ fontSize: 22, color: "#3d4650" }}>{site.anchor[locale]}</div>
        </div>
        <div style={{ position: "absolute", right: 72, bottom: 64, width: 14, height: 14, borderRadius: 7, background: "#d98e2b" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serif, style: "normal", weight: 600 },
        { name: "Plex", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
