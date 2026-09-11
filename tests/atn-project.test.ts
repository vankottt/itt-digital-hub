import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "../src/content/projects";
import { projectHeroVisuals, projectSectionVisuals, storyCovers } from "../src/content/stories";
import { projectToRecord } from "../src/lib/cms/serialize";
import { validateProjectPublish } from "../src/lib/cms/truth";

const slug = "atn-creator-social-intelligence";
const prototypeClaims = [
  "124K",
  "1.2M",
  "3.4M",
  "248K",
  "Sofia Marinova",
  "Jordan Kim",
  "€1,500",
];

describe("ATN Creator & Social Intelligence project", () => {
  const project = projects.find((item) => item.slug === slug);

  it("is added without replacing existing stories", () => {
    expect(projects.map((item) => item.slug)).toEqual([
      "ai-assisted-solar-operations",
      "local-ai-orchestration",
      "atn-warranty-portal",
      slug,
    ]);
  });

  it("stays an in-development story with no measured results", () => {
    expect(project).toBeDefined();
    expect(project?.status).toBe("in-development");
    expect(project?.measuredResults).toBeUndefined();
    const issues = validateProjectPublish(projectToRecord(project!));
    expect(issues.filter((issue) => issue.blocking)).toHaveLength(0);
  });

  it("keeps EN and BG copy structurally aligned", () => {
    expect(project?.title.en).toBe("ATN Creator & Social Intelligence Platform");
    expect(project?.title.bg).toBeTruthy();
    expect(project?.standfirst.bg).toBeTruthy();
    expect(project?.summary.bg).toBeTruthy();
    expect(project?.systemProblem.bg).toHaveLength(project!.systemProblem.en.length);
    expect(project?.objective.bg).toHaveLength(project!.objective.en.length);
    expect(project?.followUp?.bg).toHaveLength(project!.followUp!.en.length);
    expect(project?.seo?.documentTitle.en).toBe("ATN Creator & Social Intelligence Platform | ITT Digital Hub");
  });

  it("does not quote prototype UI data as project results", () => {
    const blob = JSON.stringify(project);
    for (const claim of prototypeClaims) {
      expect(blob).not.toContain(claim);
    }
  });

  it("uses the two conceptual prototype images with captions", () => {
    const cover = storyCovers[slug];
    const hero = projectHeroVisuals[slug];
    const intelligence = projectSectionVisuals[slug]?.intelligence;
    expect(cover?.src).toBe("/stories/atn-creator-collaboration-workspace.png");
    expect(hero?.src).toBe("/stories/atn-creator-collaboration-workspace.png");
    expect(intelligence?.src).toBe("/stories/atn-creator-content-intelligence.png");
    expect(hero?.caption.en).toMatch(/Conceptual product prototype/);
    expect(intelligence?.caption.bg).toMatch(/Концептуален продуктов прототип/);
    expect(existsSync(resolve("public/stories/atn-creator-collaboration-workspace.png"))).toBe(true);
    expect(existsSync(resolve("public/stories/atn-creator-content-intelligence.png"))).toBe(true);
  });
});
