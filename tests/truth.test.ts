import { describe, expect, it } from "vitest";
import { lifecycleFromStatus, partnerIsPublic, personIsPublic, canViewForPublic, translationState, validateInsightPublish, validatePersonPublish, validateProjectPublish } from "../src/lib/cms/truth";
import type { InsightRecord, PartnerRecord, PersonRecord, ProjectRecord } from "../src/lib/cms/types";

const baseProject = (): ProjectRecord => ({
  id: "1",
  slug: "x",
  titleBg: "Заглавие",
  titleEn: "Title",
  summaryBg: "с",
  summaryEn: "s",
  standfirstBg: "увод",
  standfirstEn: "lead",
  status: "pilot-concept",
  lifecycle: "concept",
  typeBg: "",
  typeEn: "",
  domainBg: "",
  domainEn: "",
  methodologyName: "ASAESIS",
  payload: {},
  seo: {},
  publicationState: "draft",
  featured: false,
  relatedProjectSlugs: [],
  relatedInsightSlugs: [],
  createdAt: "",
  updatedAt: "",
});

describe("truth controls", () => {
  it("maps public status to lifecycle", () => {
    expect(lifecycleFromStatus("pilot-concept")).toBe("concept");
    expect(lifecycleFromStatus("proposed-mandate")).toBe("proposed");
    expect(lifecycleFromStatus("active-pilot")).toBe("active");
    expect(lifecycleFromStatus("completed")).toBe("completed");
  });

  it("blocks measured results on concept projects", () => {
    const project = baseProject();
    project.payload = { measuredResults: { en: ["10%"], bg: ["10%"] } };
    const issues = validateProjectPublish(project);
    expect(issues.some((i) => i.code === "measured-on-concept" && i.blocking)).toBe(true);
  });

  it("allows empty measured results on concept projects", () => {
    const issues = validateProjectPublish(baseProject());
    expect(issues.filter((i) => i.blocking)).toHaveLength(0);
  });

  it("hides unconfirmed partners", () => {
    const partner: PartnerRecord = {
      id: "1",
      slug: "x",
      nameBg: "А",
      nameEn: "A",
      relationship: "proposed",
      publicationState: "published",
      createdAt: "",
      updatedAt: "",
    };
    expect(partnerIsPublic(partner)).toBe(false);
    expect(partnerIsPublic({ ...partner, relationship: "confirmed" })).toBe(true);
  });

  it("blocks planned roles from public profiles", () => {
    const person: PersonRecord = {
      id: "1",
      slug: "x",
      kind: "planned_role",
      nameBg: "Роля",
      nameEn: "Role",
      expertiseBg: [],
      expertiseEn: [],
      bioBg: [],
      bioEn: [],
      relatedProjectSlugs: [],
      relatedInsightSlugs: [],
      seo: {},
      publicationState: "published",
      createdAt: "",
      updatedAt: "",
    };
    expect(personIsPublic(person)).toBe(false);
    expect(validatePersonPublish(person).some((i) => i.code === "planned-role" && i.blocking)).toBe(true);
  });

  it("reports translation completeness", () => {
    expect(translationState("а", "a")).toBe("both");
    expect(translationState("а", "")).toBe("en-missing");
    expect(translationState("", "a")).toBe("bg-missing");
  });

  it("excludes drafts from public view unless preview matches", () => {
    expect(canViewForPublic("draft", null, "project", "wine")).toBe(false);
    expect(canViewForPublic("published", null, "project", "wine")).toBe(true);
    expect(canViewForPublic("draft", { kind: "project", slug: "wine" }, "project", "wine")).toBe(true);
    expect(canViewForPublic("draft", { kind: "project", slug: "other" }, "project", "wine")).toBe(false);
    expect(canViewForPublic("review", { kind: "insight", slug: "wine" }, "project", "wine")).toBe(false);
  });

  it("requires source and publication date only for news", () => {
    const note: InsightRecord = {
      id: "1",
      slug: "note",
      type: "concept-note",
      titleBg: "Заглавие",
      titleEn: "Title",
      summaryBg: "резюме",
      summaryEn: "summary",
      bodyBg: [],
      bodyEn: [],
      topicsBg: [],
      topicsEn: [],
      relatedProjectSlugs: [],
      seo: {},
      publicationState: "draft",
      createdAt: "",
      updatedAt: "",
    };
    expect(validateInsightPublish(note).filter((i) => i.blocking)).toHaveLength(0);

    const news = { ...note, slug: "news", type: "news" };
    const issues = validateInsightPublish(news);
    expect(issues.some((i) => i.code === "news-date" && i.blocking)).toBe(true);
    expect(issues.some((i) => i.code === "news-source" && i.blocking)).toBe(true);

    const complete = {
      ...news,
      date: "2025-12-02",
      sourceBg: "uacg.bg",
      sourceEn: "uacg.bg",
    };
    expect(validateInsightPublish(complete).filter((i) => i.blocking)).toHaveLength(0);
    expect(validateInsightPublish(complete).some((i) => i.code === "news-hero")).toBe(false);
  });
});
