"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CheckIcon, CopyIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/ButtonLink";

async function writeClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  onCopied,
  className,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  onCopied?: () => void;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function onCopy() {
    const ok = await writeClipboard(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="secondary" arrow={false} onClick={() => void onCopy()} className={cn("min-h-11 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2", className)}>
      {copied ? <CheckIcon className="shrink-0" /> : <CopyIcon className="shrink-0" />}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
}
