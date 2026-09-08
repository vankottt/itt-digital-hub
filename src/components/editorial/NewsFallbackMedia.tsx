import { cn } from "@/lib/cn";

/** Non-photographic card face when an article has no library media. */
export function NewsFallbackMedia({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "drafting-grid relative flex h-full min-h-[11rem] flex-col justify-between overflow-hidden border-b border-line bg-paper-2 p-5 md:min-h-[12.5rem]",
        className,
      )}
    >
      <span className="absolute top-4 right-4 h-1.5 w-1.5 bg-amber" aria-hidden="true" />
      <span
        className="pointer-events-none absolute inset-y-5 right-[28%] w-px bg-line"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute top-[42%] right-[18%] h-10 w-10 rounded-full border border-line-strong"
        aria-hidden="true"
      />
      <p className="label">{label}</p>
      <p className="font-serif text-h4 text-ink/55">ITT</p>
    </div>
  );
}
