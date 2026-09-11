import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { Project, StorySection } from "@/content/types";
import { projectStoryVisuals, type ProjectVisual } from "@/content/stories";
import { projectsPage as c } from "@/content/pages";
import { EditorialFigure } from "@/components/editorial/EditorialFigure";
import { Paragraphs } from "@/components/editorial/Blocks";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { href } from "@/lib/paths";
import { ProjectSection } from "./ProjectSection";
import { CapabilityList, OrchestrationArchitectureVisual, ProcessFlow, PullQuote, SolarMarketVisual } from "./ProjectVisuals";

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

function StoryPhoto({ visual, locale }: { visual: ProjectVisual; locale: Locale }) {
  return (
    <EditorialFigure
      src={visual.src}
      alt={visual.alt[locale]}
      caption={visual.caption?.[locale]}
      ratio="aspect-[16/9]"
      className="overflow-hidden rounded-[1.25rem] border-0"
      imageClassName="object-cover"
      objectPosition={visual.objectPosition}
    />
  );
}

function StoryVisuals({ slug, locale, slot }: { slug: string; locale: Locale; slot: "built" | "how" | "value" }) {
  const photo = projectStoryVisuals[slug]?.[slot];
  if (photo) return <StoryPhoto visual={photo} locale={locale} />;
  if (slug === "ai-assisted-solar-operations" && slot === "how") return <SolarMarketVisual locale={locale} />;
  if (slug === "local-ai-orchestration" && slot === "how") return <OrchestrationArchitectureVisual locale={locale} />;
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
      {story.extras?.map((section, index) => (
        <StoryBlock key={section.heading.en} id={`extra-${index}`} section={section} locale={locale} />
      ))}
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
