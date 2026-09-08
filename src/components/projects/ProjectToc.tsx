import { cn } from "@/lib/cn";

export function ProjectToc({
  items,
  heading,
}: {
  items: Array<{ id: string; label: string }>;
  heading: string;
}) {
  return (
    <nav aria-label={heading} className="hidden lg:block">
      <div className="lg:sticky lg:top-28">
        <p className="label mb-4">{heading}</p>
        <ol className="space-y-2 border-l border-line pl-4">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={cn("text-small text-ink-2 no-underline transition-colors duration-150 hover:text-ink")}>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
