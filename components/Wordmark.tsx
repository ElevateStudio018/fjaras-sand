import { withBasePath } from "@/lib/site/images.ts";
import type { Settings } from "@/lib/site/schema.ts";

/** What the logo spots (header, menu, footer) need to draw the logo. */
export interface LogoContent {
  logo: Settings["logo"];
  /** The company's name for screen readers. */
  name: string;
}

// Fjärås Sand & Makadam's own logo (public/logo-fjaras.png, from fjarassand.se), used as a mask so it is drawn in the
// current text colour: white on the blue bar, the menu and the footer, blue in the admin. An uploaded logo replaces it at
// the same height.
const LOGO_SRC = "/logo-fjaras.png";
const LOGO_RATIO = 200 / 73;

export function Wordmark({ content, className = "" }: { content: LogoContent; className?: string }) {
  if (content.logo.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={withBasePath(content.logo.image.src)} alt={content.logo.image.alt || content.name} className={`h-10 w-auto sm:h-12 ${className}`} />
    );
  }

  const mask = `url(${withBasePath(LOGO_SRC)}) center / contain no-repeat`;
  return (
    <span className={`block h-11 bg-current sm:h-[52px] ${className}`} style={{ aspectRatio: LOGO_RATIO, mask, WebkitMask: mask }}>
      <span className="sr-only">{content.name}</span>
    </span>
  );
}
