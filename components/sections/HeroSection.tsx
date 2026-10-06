import { ArrowLabel, buttonClasses } from "../Button";
import { SiteLink } from "../SiteLink";
import { Icon } from "../Icon";
import { Photo } from "../Photo";
import { ZoomImage } from "../ZoomImage";
import { list } from "@/lib/site/collection.ts";
import { focusStyle, imageProps } from "@/lib/site/images.ts";
import { toTelHref } from "@/lib/site/format.ts";
import type { SectionOf } from "@/lib/site/schema.ts";
import type { SectionProps } from "./types";

type Hero = SectionOf<"hero">;
type Ctx = SectionProps<"hero">["ctx"];

/** The first screen, in the layout the content picks (see heroLayouts in the schema). */
export function HeroSection({ section, ctx }: SectionProps<"hero">) {
  switch (section.layout) {
    case "split":
      return <SplitHero section={section} ctx={ctx} />;
    case "frame":
      return <FrameHero section={section} ctx={ctx} />;
    case "headline":
      return <HeadlineHero section={section} ctx={ctx} />;
    case "collage":
      return <CollageHero section={section} ctx={ctx} />;
    case "infobar":
      return <InfobarHero section={section} ctx={ctx} />;
    default:
      return <PhotoHero section={section} ctx={ctx} />;
  }
}

// --- Shared parts

function Eyebrow({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return <p className={`animate-rise text-tag uppercase [animation-delay:150ms] lg:text-[14px] ${className}`}>{text}</p>;
}

/** The quote button and, beside it, the phone number as a second way in. */
function Actions({ section, ctx, tone }: { section: Hero; ctx: Ctx; tone: "dark" | "light" }) {
  const { phone } = ctx.site.company;
  return (
    <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:450ms] lg:mt-10">
      {section.button.label && (
        <SiteLink href={section.button.href} className={buttonClasses("solid", "group/arrow focus-visible:outline-current")}>
          <span>
            <ArrowLabel spaced>{section.button.label}</ArrowLabel>
          </span>
        </SiteLink>
      )}
      {phone && (
        <a href={toTelHref(phone)} aria-label={`${ctx.site.ui.callPrefix} ${phone}`} className={buttonClasses(tone === "dark" ? "on-primary" : "outline", "gap-3")}>
          <Icon name="Phone" className="h-5 w-5" />
          {phone}
        </a>
      )}
    </div>
  );
}

const headingType = "animate-rise font-extrabold leading-[1.02] tracking-[-0.02em] [animation-delay:300ms]";

// --- 1. The photo across the whole screen, the text over it near the bottom left.
function PhotoHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-secondary sm:min-h-[calc(100svh-5rem)]">
      <ZoomImage
        {...imageProps(section.image, "100vw")}
        alt={section.image.alt}
        priority
        parallax="top"
        style={focusStyle(section.image)}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[74%_center] lg:object-[75%_55%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/75 via-black/40 to-black/10" />
      <div className="mx-auto mt-auto w-full max-w-content px-4 pb-12 sm:px-6 sm:pb-16 lg:my-auto lg:px-8 lg:pb-0 lg:pt-[8svh]">
        <Eyebrow text={section.eyebrow} className="text-white/85" />
        <h1 className={`mt-4 max-w-[12em] text-[38px] text-white sm:text-[56px] lg:mt-6 xl:text-[68px] ${headingType}`}>{section.heading}</h1>
        <Actions section={section} ctx={ctx} tone="dark" />
      </div>
    </section>
  );
}

// --- 2. Split: the text on a block of the primary colour, the photo beside it to the edge of the screen.
function SplitHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className="grid bg-primary lg:min-h-[calc(92svh-5rem)] lg:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden lg:order-2 lg:aspect-auto">
        <ZoomImage {...imageProps(section.image, "(min-width: 1024px) 50vw, 100vw")} alt={section.image.alt} priority style={focusStyle(section.image)} className="absolute inset-0 h-full w-full object-cover" />
        {/* A band of the accent along the seam between text and photo. */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-accent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-2" />
      </div>
      <div className="flex items-center px-4 py-14 sm:px-6 lg:order-1 lg:py-20 lg:pl-[max(2rem,calc((100vw-1140px)/2+2rem))] lg:pr-16">
        <div>
          <Eyebrow text={section.eyebrow} className="text-accent" />
          <h1 className={`mt-4 text-[38px] text-on-primary sm:text-[52px] lg:mt-6 xl:text-[60px] ${headingType}`}>{section.heading}</h1>
          <Actions section={section} ctx={ctx} tone="dark" />
        </div>
      </div>
    </section>
  );
}

// --- 3. Frame: the photo set in from the edges with rounded corners, the text on a card overlapping its foot.
function FrameHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className="bg-page px-3 pb-6 pt-3 sm:px-6 sm:pt-6 lg:pb-10">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="relative h-[46svh] overflow-hidden rounded-xl sm:h-[60svh] lg:h-[72svh]">
          <ZoomImage {...imageProps(section.image, "100vw")} alt={section.image.alt} priority parallax="top" style={focusStyle(section.image)} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="relative z-10 mx-3 -mt-16 max-w-2xl rounded-xl border-t-[6px] border-accent bg-card p-6 shadow-xl sm:mx-8 sm:-mt-28 sm:p-10 lg:absolute lg:bottom-10 lg:left-10 lg:mx-0 lg:mt-0">
          <Eyebrow text={section.eyebrow} className="text-primary" />
          <h1 className={`mt-3 text-[34px] text-heading sm:text-[46px] lg:text-[52px] ${headingType}`}>{section.heading}</h1>
          <Actions section={section} ctx={ctx} tone="light" />
        </div>
      </div>
    </section>
  );
}

// --- 4. Headline: a large heading on the page colour, the company's details as a row of facts, and a wide strip of
// photo under it from edge to edge.
function HeadlineHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className="bg-page">
      <div className="mx-auto max-w-content px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-14 lg:pt-20">
        <Eyebrow text={section.eyebrow} className="text-primary" />
        <div className="mt-4 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end lg:gap-16">
          <h1 className={`text-[42px] text-heading sm:text-[64px] xl:text-[84px] ${headingType}`}>{section.heading}</h1>
          <div className="lg:pb-3">
            <Facts ctx={ctx} tone="light" />
            <Actions section={section} ctx={ctx} tone="light" />
          </div>
        </div>
      </div>
      <div className="relative h-[34svh] overflow-hidden border-t-[6px] border-accent sm:h-[44svh]">
        <ZoomImage {...imageProps(section.image, "100vw")} alt={section.image.alt} priority parallax="top" style={focusStyle(section.image)} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </section>
  );
}

// --- 5. Collage: the text on the dark colour, beside the photo and three of the products in a grid.
function CollageHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  // One product of each kind, so the three small photos differ.
  const seen = new Set<string>();
  const products = list(ctx.site.uppdrag).filter((item) => !seen.has(item.tag) && seen.add(item.tag)).slice(0, 3);
  return (
    <section id={section.anchor || undefined} className="bg-secondary">
      <div className="mx-auto grid max-w-content items-center gap-10 px-4 py-12 sm:px-6 lg:min-h-[calc(88svh-5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:px-8 lg:py-16">
        <div>
          <Eyebrow text={section.eyebrow} className="text-accent" />
          <h1 className={`mt-4 text-[38px] text-white sm:text-[52px] lg:mt-6 xl:text-[58px] ${headingType}`}>{section.heading}</h1>
          <Actions section={section} ctx={ctx} tone="dark" />
        </div>
        <div className="grid h-[420px] animate-rise grid-cols-3 grid-rows-3 gap-2 [animation-delay:300ms] sm:h-[520px] sm:gap-3">
          <div className="relative col-span-2 row-span-3 overflow-hidden rounded-lg">
            <ZoomImage {...imageProps(section.image, "(min-width: 1024px) 35vw, 66vw")} alt={section.image.alt} priority style={focusStyle(section.image)} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {products.map((item) => (
            <SiteLink key={item.id} href={item.href} className="group relative overflow-hidden rounded-lg">
              <Photo {...imageProps(item.image, "200px")} alt={item.image.alt} className="absolute inset-0 h-full w-full object-cover group-hover:scale-110" transition="transform 500ms ease-out" style={focusStyle(item.image)} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6 text-[12px] font-semibold text-white sm:text-[13px]">{item.tag}</span>
            </SiteLink>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 6. Info bar: the photo across the screen with the text over it, and a bar of the primary colour along its foot
// with the company's facts.
function InfobarHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className="relative isolate flex min-h-[calc(92svh-4rem)] flex-col overflow-hidden bg-secondary sm:min-h-[calc(92svh-5rem)]">
      <ZoomImage {...imageProps(section.image, "100vw")} alt={section.image.alt} priority parallax="top" style={focusStyle(section.image)} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
      <div className="mx-auto my-auto w-full max-w-content px-4 py-14 sm:px-6 lg:px-8">
        <Eyebrow text={section.eyebrow} className="text-accent" />
        <h1 className={`mt-4 max-w-[13em] text-[38px] text-white sm:text-[56px] lg:mt-6 xl:text-[64px] ${headingType}`}>{section.heading}</h1>
        <Actions section={section} ctx={ctx} tone="dark" />
      </div>
      <div className="bg-primary">
        <div className="mx-auto max-w-content px-4 py-5 sm:px-6 lg:px-8">
          <Facts ctx={ctx} tone="dark" />
        </div>
      </div>
    </section>
  );
}

/** The company's year, opening hours, phone and town as a row of small facts. */
function Facts({ ctx, tone }: { ctx: Ctx; tone: "dark" | "light" }) {
  const { company } = ctx.site;
  const rows: { icon: "Calendar" | "Clock" | "MapPin"; text: string }[] = [
    { icon: "Calendar", text: `Sedan ${company.foundedYear}` },
    ...(company.openingHours ? [{ icon: "Clock" as const, text: company.openingHours }] : []),
    { icon: "MapPin", text: company.address.city || company.city },
  ];
  const text = tone === "dark" ? "text-on-primary" : "text-heading";
  return (
    <ul className={`flex animate-rise flex-wrap gap-x-8 gap-y-3 text-[15px] font-semibold [animation-delay:400ms] ${text}`}>
      {rows.map((row) => (
        <li key={row.icon} className="flex items-center gap-2.5">
          <Icon name={row.icon} className={`h-5 w-5 shrink-0 ${tone === "dark" ? "text-accent" : "text-accent-ink"}`} strokeWidth={2} />
          {row.text}
        </li>
      ))}
    </ul>
  );
}
