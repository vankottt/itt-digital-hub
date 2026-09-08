import { describe, expect, it } from "vitest";
import { insightRecordFromForm, personRecordFromForm } from "../src/lib/cms/form-merge";
import type { InsightRecord, PersonRecord } from "../src/lib/cms/types";

function insightFixture(): InsightRecord {
  return {
    id: "insight-news-1",
    slug: "kogato-praktikata-vleze-v-universiteta",
    type: "news",
    titleBg: "Стара заглавие",
    titleEn: "Old title",
    summaryBg: "Резюме",
    summaryEn: "Summary",
    bodyBg: ["тяло"],
    bodyEn: ["body"],
    topicsBg: ["УАСГ"],
    topicsEn: ["UASG"],
    relatedProjectSlugs: ["wine-sector-system-architecture"],
    sourceBg: "uacg.bg",
    sourceEn: "uacg.bg",
    date: "2025-12-02",
    author: "UASG newsroom",
    heroMediaId: "media-campus-facade",
    seo: {
      titleBg: "SEO BG",
      titleEn: "SEO EN",
      descriptionBg: "desc bg",
      descriptionEn: "desc en",
    },
    publicationState: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    publishedAt: "2026-01-02T00:00:00.000Z",
    createdBy: "staff-1",
  };
}

describe("insight form merge", () => {
  it("preserves date, author, source, SEO and media when those fields are omitted", () => {
    const existing = insightFixture();
    const form = new FormData();
    form.set("id", existing.id);
    form.set("slug", existing.slug);
    form.set("type", "news");
    form.set("titleBg", "Ново заглавие");
    form.set("titleEn", "New title");
    form.set("summaryBg", existing.summaryBg);
    form.set("summaryEn", existing.summaryEn);
    const record = insightRecordFromForm(form, existing, "staff-2", "2026-09-07T00:00:00.000Z");
    expect(record.titleBg).toBe("Ново заглавие");
    expect(record.titleEn).toBe("New title");
    expect(record.date).toBe("2025-12-02");
    expect(record.author).toBe("UASG newsroom");
    expect(record.sourceBg).toBe("uacg.bg");
    expect(record.sourceEn).toBe("uacg.bg");
    expect(record.heroMediaId).toBe("media-campus-facade");
    expect(record.seo).toEqual(existing.seo);
    expect(record.publicationState).toBe("published");
    expect(record.publishedAt).toBe(existing.publishedAt);
    expect(record.bodyBg).toEqual(["тяло"]);
    expect(record.createdBy).toBe("staff-1");
    expect(record.updatedBy).toBe("staff-2");
  });

  it("clears optional metadata only when the form submits empty values", () => {
    const existing = insightFixture();
    const form = new FormData();
    form.set("slug", existing.slug);
    form.set("titleBg", existing.titleBg);
    form.set("titleEn", existing.titleEn);
    form.set("date", "");
    form.set("author", "  ");
    form.set("sourceBg", "");
    form.set("heroMediaId", "");
    const record = insightRecordFromForm(form, existing, "staff-2");
    expect(record.date).toBeUndefined();
    expect(record.author).toBeUndefined();
    expect(record.sourceBg).toBeUndefined();
    expect(record.heroMediaId).toBeUndefined();
    expect(record.sourceEn).toBe("uacg.bg");
  });
});

describe("person form merge", () => {
  it("does not wipe SEO, photo or related slugs omitted from the team form", () => {
    const existing: PersonRecord = {
      id: "person-1",
      slug: "ivan-todorov",
      kind: "appointed_person",
      nameBg: "Иван",
      nameEn: "Ivan",
      roleBg: "role",
      roleEn: "role",
      affiliationBg: "UASG",
      affiliationEn: "UASG",
      expertiseBg: ["systems"],
      expertiseEn: ["systems"],
      bioBg: ["био"],
      bioEn: ["bio"],
      photoMediaId: "media-portrait",
      relatedProjectSlugs: ["wine-sector-system-architecture"],
      relatedInsightSlugs: ["asaesis-from-framework-to-method"],
      seo: { titleEn: "Ivan Todorov" },
      publicationState: "draft",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const form = new FormData();
    form.set("id", existing.id);
    form.set("slug", existing.slug);
    form.set("kind", "appointed_person");
    form.set("nameBg", "Иван Тодоров");
    form.set("nameEn", "Ivan Todorov");
    const record = personRecordFromForm(form, existing, "staff-2");
    expect(record.nameBg).toBe("Иван Тодоров");
    expect(record.seo).toEqual({ titleEn: "Ivan Todorov" });
    expect(record.photoMediaId).toBe("media-portrait");
    expect(record.affiliationBg).toBe("UASG");
    expect(record.relatedProjectSlugs).toEqual(["wine-sector-system-architecture"]);
    expect(record.expertiseBg).toEqual(["systems"]);
    expect(record.bioEn).toEqual(["bio"]);
  });
});
