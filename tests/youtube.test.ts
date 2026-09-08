import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Blocks } from "../src/components/editorial/Blocks";
import type { MediaRecord } from "../src/lib/cms/types";
import { parseLibraryMediaBlock } from "../src/lib/news-presentation";
import { parseYouTubeBlock, youtubeBackgroundEmbedSrc, youtubeEmbedSrc, youtubeWatchUrl } from "../src/lib/youtube";

const ID = "abcdefghijk";

describe("parseYouTubeBlock", () => {
  it("accepts watch, short, embed, shorts, live and mobile hosts", () => {
    const urls = [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://youtu.be/${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `www.youtube.com/watch?v=${ID}`,
    ];
    for (const url of urls) {
      expect(parseYouTubeBlock(url), url).toEqual({ id: ID });
    }
  });

  it("reads start time from t=, start= and hash clocks", () => {
    expect(parseYouTubeBlock(`https://youtu.be/${ID}?t=90`)).toEqual({ id: ID, start: 90 });
    expect(parseYouTubeBlock(`https://www.youtube.com/watch?v=${ID}&t=1m30s`)).toEqual({ id: ID, start: 90 });
    expect(parseYouTubeBlock(`https://www.youtube.com/embed/${ID}?start=12`)).toEqual({ id: ID, start: 12 });
    expect(parseYouTubeBlock(`https://www.youtube.com/watch?v=${ID}#t=30s`)).toEqual({ id: ID, start: 30 });
  });

  it("keeps the video id when a playlist param is present", () => {
    expect(parseYouTubeBlock(`https://www.youtube.com/watch?v=${ID}&list=PLexample`)).toEqual({ id: ID });
  });

  it("rejects sentences, other hosts and incomplete ids", () => {
    expect(parseYouTubeBlock(`See https://youtu.be/${ID} for context`)).toBeNull();
    expect(parseYouTubeBlock("https://vimeo.com/123456789")).toBeNull();
    expect(parseYouTubeBlock("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(parseYouTubeBlock("https://www.youtube.com/playlist?list=PLexample")).toBeNull();
    expect(parseYouTubeBlock(`<iframe src="https://www.youtube.com/embed/${ID}"></iframe>`)).toBeNull();
  });
});

describe("youtube URLs", () => {
  it("builds a nocookie embed without autoplay", () => {
    expect(youtubeEmbedSrc({ id: ID })).toBe(`https://www.youtube-nocookie.com/embed/${ID}?rel=0`);
    expect(youtubeEmbedSrc({ id: ID, start: 90 })).toBe(`https://www.youtube-nocookie.com/embed/${ID}?rel=0&start=90`);
    expect(youtubeEmbedSrc({ id: ID })).not.toContain("autoplay");
  });

  it("builds a muted looping background embed without changing the insight helper", () => {
    const src = youtubeBackgroundEmbedSrc({ id: ID });
    expect(src).toContain("youtube-nocookie.com/embed/");
    expect(src).toContain("autoplay=1");
    expect(src).toContain("mute=1");
    expect(src).toContain("loop=1");
    expect(src).toContain(`playlist=${ID}`);
    expect(youtubeEmbedSrc({ id: ID })).not.toContain("autoplay");
  });

  it("builds a watch URL for the caption link", () => {
    expect(youtubeWatchUrl({ id: ID, start: 90 })).toBe(`https://www.youtube.com/watch?v=${ID}&t=90`);
  });
});

describe("Blocks YouTube rendering", () => {
  it("renders a lazy iframe instead of a paragraph", () => {
    const html = renderToStaticMarkup(
      createElement(Blocks, { locale: "en", blocks: [`https://www.youtube.com/watch?v=${ID}`] }),
    );
    expect(html).toContain(`youtube-nocookie.com/embed/${ID}?rel=0`);
    expect(html).toContain("Watch on YouTube");
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("<p>");
    expect(html).not.toContain("autoplay");
  });
});

describe("Blocks library media", () => {
  const sample: MediaRecord = {
    id: "media-sample-figure",
    publicUrl: "/images/team/ivan-todorov-portrait-v2.png",
    altBg: "Модел",
    altEn: "Model",
    captionBg: "Подпис",
    captionEn: "Caption",
    temporary: false,
    replacementRequired: false,
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z",
  };

  it("accepts a whole-line media id and ignores sentences", () => {
    expect(parseLibraryMediaBlock("media-sample-figure")).toBe("media-sample-figure");
    expect(parseLibraryMediaBlock("See media-sample-figure")).toBeNull();
    expect(parseLibraryMediaBlock("https://www.youtube.com/watch?v=abcdefghijk")).toBeNull();
  });

  it("renders an editorial figure instead of the id, and skips unknown ids", () => {
    const html = renderToStaticMarkup(
      createElement(Blocks, {
        locale: "en",
        media: [sample],
        blocks: ["Before.", sample.id, "After.", "media-does-not-exist"],
      }),
    );
    expect(html).toContain("ivan-todorov-portrait-v2.png");
    expect(html).not.toContain("Caption");
    expect(html).not.toContain("<figcaption");
    expect(html).toContain("object-cover");
    expect(html).not.toContain(sample.id);
    expect(html).not.toContain("media-does-not-exist");
    expect(html).toContain("Before.");
    expect(html).toContain("After.");
  });
});
