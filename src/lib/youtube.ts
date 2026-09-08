/** Recognized YouTube clip from an insight body block (a whole line). */

export type YouTubeClip = {
  id: string;
  /** Start offset in seconds, when the source URL requested one. */
  start?: number;
};

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

function withProtocol(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function parseClock(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }
  const match = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match || match[0] === "") return undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  if (!match[1] && !match[2] && !match[3]) return undefined;
  return hours * 3600 + minutes * 60 + seconds;
}

function startFromUrl(url: URL): number | undefined {
  const fromQuery = url.searchParams.get("start") ?? url.searchParams.get("t");
  if (fromQuery) {
    const parsed = parseClock(fromQuery);
    if (parsed !== undefined) return parsed;
  }
  const hash = url.hash.replace(/^#/, "");
  if (hash.startsWith("t=")) return parseClock(hash.slice(2));
  return undefined;
}

function idFromPrefixedPath(pathname: string, prefixes: readonly string[]): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const prefix = parts[0];
  const candidate = parts[1]?.split(".")[0];
  if (!prefix || !candidate || !prefixes.includes(prefix)) return null;
  return VIDEO_ID.test(candidate) ? candidate : null;
}

/**
 * Parse an insight body block as a YouTube URL.
 * The whole trimmed line must be a single YouTube URL — not a sentence that contains one.
 */
export function parseYouTubeBlock(block: string): YouTubeClip | null {
  const raw = block.trim().replace(/^['"]|['"]$/g, "").trim();
  if (!raw || /\s/.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(withProtocol(raw));
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;

  let id: string | null = null;
  if (host === "youtu.be" || host === "www.youtu.be") {
    const segment = url.pathname.split("/").filter(Boolean)[0]?.split(".")[0];
    id = segment && VIDEO_ID.test(segment) ? segment : null;
  } else if (url.pathname === "/watch" || url.pathname.startsWith("/watch/")) {
    const v = url.searchParams.get("v");
    id = v && VIDEO_ID.test(v) ? v : null;
  } else {
    id = idFromPrefixedPath(url.pathname, ["embed", "shorts", "live", "v", "e"]);
  }

  if (!id) return null;

  const start = startFromUrl(url);
  if (start && start > 0) return { id, start };
  return { id };
}

export function youtubeEmbedSrc(clip: YouTubeClip): string {
  const params = new URLSearchParams({ rel: "0" });
  if (clip.start && clip.start > 0) params.set("start", String(Math.floor(clip.start)));
  return `https://www.youtube-nocookie.com/embed/${clip.id}?${params.toString()}`;
}

/**
 * Muted looping background embed for a labeled homepage mock only.
 * Insight body embeds must keep using `youtubeEmbedSrc` (no autoplay).
 */
export function youtubeBackgroundEmbedSrc(clip: YouTubeClip): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: clip.id,
    controls: "0",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });
  if (clip.start && clip.start > 0) params.set("start", String(Math.floor(clip.start)));
  return `https://www.youtube-nocookie.com/embed/${clip.id}?${params.toString()}`;
}

export function youtubeWatchUrl(clip: YouTubeClip): string {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", clip.id);
  if (clip.start && clip.start > 0) url.searchParams.set("t", String(Math.floor(clip.start)));
  return url.toString();
}
