import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { Project, StorySection } from "@/content/types";
import { projectsPage as c } from "@/content/pages";
import { Paragraphs } from "@/components/editorial/Blocks";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { href } from "@/lib/paths";
import { ProjectSection } from "./ProjectSection";
import {
  CapabilityList,
  CreatorAnalyticsVisual,
  ProcessFlow,
  PullQuote,
  SolarMarketVisual,
  WarrantyDashboardVisual,
  WarrantyVerificationVisual,
} from "./ProjectVisuals";

function StoryBlock({
  id,
  section,
  locale,
  visual,
}: {
  id: string;
  section: StorySection;
  locale: Locale;
  visual?: ReactNode;
}) {
  return (
    <ProjectSection id={id} heading={section.heading[locale]}>
      <Paragraphs items={section.body[locale]} />
      {section.steps ? <ProcessFlow items={section.steps[locale]} /> : null}
      {section.items ? <CapabilityList items={section.items[locale]} /> : null}
      {section.quote ? <PullQuote>{section.quote[locale]}</PullQuote> : null}
      {visual ? <div className="mt-8">{visual}</div> : null}
    </ProjectSection>
  );
}

function StoryVisuals({ slug, locale, slot }: { slug: string; locale: Locale; slot: "built" | "how" | "value" }) {
  if (slug === "atn-warranty-portal" && slot === "built") return <WarrantyVerificationVisual locale={locale} />;
  if (slug === "atn-warranty-portal" && slot === "value") return <WarrantyDashboardVisual locale={locale} />;
  if (slug === "atn-creator-social-intelligence" && slot === "value") return <CreatorAnalyticsVisual locale={locale} />;
  if (slug === "ai-assisted-solar-operations" && slot === "how") return <SolarMarketVisual locale={locale} />;
  return null;
}

export function ProjectStory({ project, locale }: { project: Project; locale: Locale }) {
  const story = project.story;
  const d = c.detail;

  return (
    <>
      <StoryBlock id="challenge" section={story.challenge} locale={locale} />
      <StoryBlock id="built" section={story.built} locale={locale} visual={<StoryVisuals slug={project.slug} locale={locale} slot="built" />} />
      {story.howItWorks ? (
        <StoryBlock id="how" section={story.howItWorks} locale={locale} visual={<StoryVisuals slug={project.slug} locale={locale} slot="how" />} />
      ) : null}
      {story.value ? (
        <StoryBlock id="value" section={story.value} locale={locale} visual={<StoryVisuals slug={project.slug} locale={locale} slot="value" />} />
      ) : null}
      <StoryBlock id="outcome" section={story.outcome} locale={locale} />

      <div className="border-t border-line py-10">
        <p className="label">{d.next[locale]}</p>
        <div className="mt-5">
          <ButtonLink href={href(locale, "work-with-us")}>{project.cta[locale]}</ButtonLink>
        </div>
      </div>
    </>
  );
}
