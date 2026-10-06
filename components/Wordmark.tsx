import { withBasePath } from "@/lib/site/images.ts";
import type { Settings } from "@/lib/site/schema.ts";

/** What the logo spots (header, menu, footer) need to draw the logo. */
export interface LogoContent {
  logo: Settings["logo"];
  /** The company's name for screen readers. */
  name: string;
}

// Fjärås Sand & Makadam's logo redrawn from their artwork (public/photos/site/logo-*.png, too small to use as it is): a
// standing stone beside "AB FJÄRÅS" over "SAND & MAKADAM", in heavy wide capitals, drawn in the current text colour –
// white on the blue bar, the menu and the footer. An uploaded logo replaces it at the same height.
export function Wordmark({ content, className = "" }: { content: LogoContent; className?: string }) {
  if (content.logo.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={withBasePath(content.logo.image.src)} alt={content.logo.image.alt || content.name} className={`h-10 w-auto sm:h-12 ${className}`} />
    );
  }

  return (
    <span className={`flex h-11 items-center gap-2.5 sm:h-12 ${className}`}>
      <svg viewBox="0 0 24 48" aria-hidden="true" className="h-10 w-auto shrink-0 sm:h-11" fill="currentColor">
        {/* A tall, rough standing stone. */}
        <path d="M9.5 1.5 14 3l3.5 4 1 9-1.2 8 1.7 9-1 9.5L19 47H4l-.8-4.5L4 33l-1.4-8.5L4 15l1.6-9.5z" />
      </svg>
      <span className="flex flex-col font-heading font-black uppercase leading-[0.95]">
        <span className="text-[19px] tracking-[0.04em] sm:text-[22px]">AB Fjärås</span>
        <span className="text-[11.5px] tracking-[0.06em] sm:text-[13px]">Sand &amp; Makadam</span>
        <span className="sr-only"> – {content.name}</span>
      </span>
    </span>
  );
}
