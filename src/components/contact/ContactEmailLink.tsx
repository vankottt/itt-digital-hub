import type { ReactNode } from "react";
import { contactEmail } from "@/content/site";
import { cn } from "@/lib/cn";

export function ContactEmailLink({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "on-dark";
}) {
  return (
    <a
      href={`mailto:${contactEmail}`}
      className={cn(
        tone === "on-dark"
          ? "text-on-dark-muted transition-colors duration-150 hover:text-on-dark hover:underline hover:decoration-amber hover:underline-offset-[4px]"
          : "link-quiet",
        "break-words",
        className,
      )}
    >
      {contactEmail}
    </a>
  );
}

/** Public inbox plus the rest of the contact lead. Gmail stays off the page. */
export function ContactLead({ after }: { after: string }): ReactNode {
  return (
    <>
      <ContactEmailLink />
      {after}
    </>
  );
}
