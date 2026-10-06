import { ArrowLabel, buttonClasses } from "../Button";
import { SiteLink } from "../SiteLink";
import { Icon } from "../Icon";
import { ZoomImage } from "../ZoomImage";
import { focusStyle, imageProps } from "@/lib/site/images.ts";
import { toTelHref } from "@/lib/site/format.ts";
import type { SectionOf } from "@/lib/site/schema.ts";
import type { SectionProps } from "./types";

type Hero = SectionOf<"hero">;
type Ctx = SectionProps<"hero">["ctx"];

/** The first screen, in the layout the content picks (see heroLayouts in the schema). The photo always fills it; the
 * layouts differ in where the text sits and how the buttons are set. */
export function HeroSection({ section, ctx }: SectionProps<"hero">) {
  switch (section.layout) {
    case "center":
      return <CenterHero section={section} ctx={ctx} />;
    case "panel":
      return <PanelHero section={section} ctx={ctx} />;
    case "card":
      return <CardHero section={section} ctx={ctx} />;
    case "tiles":
      return <TilesHero section={section} ctx={ctx} />;
    case "infobar":
      return <InfobarHero section={section} ctx={ctx} />;
    default:
      return <PhotoHero section={section} ctx={ctx} />;
  }
}

// --- Shared parts

const sectionBase = "relative isolate flex flex-col overflow-hidden bg-secondary";
const fullHeight = "min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)]";

/** The photo behind the whole hero, with a shade over it for the text to read on. */
function Backdrop({ section, shade }: { section: Hero; shade: string }) {
  return (
    <>
      <ZoomImage
        {...imageProps(section.image, "100vw")}
        alt={section.image.alt}
        priority
        parallax="top"
        style={focusStyle(section.image)}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[74%_center] lg:object-[75%_55%]"
      />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${shade}`} />
    </>
  );
}

function Eyebrow({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return <p className={`animate-rise text-tag uppercase [animation-delay:150ms] lg:text-[14px] ${className}`}>{text}</p>;
}

/** The quote button and the phone number as a second way in: as an outlined button, or as a plain link beside it.
 * Stacked, both run the full width. */
function Actions({ section, ctx, phoneAs = "button", tone = "dark", stacked = false, className = "" }: { section: Hero; ctx: Ctx; phoneAs?: "button" | "link"; tone?: "dark" | "light"; stacked?: boolean; className?: string }) {
  const { phone } = ctx.site.company;
  const width = stacked ? "w-full" : "";
  return (
    <div className={`mt-8 flex animate-rise gap-3 [animation-delay:450ms] lg:mt-10 ${stacked ? "flex-col" : "flex-wrap items-center gap-x-6"} ${className}`}>
      {section.button.label && (
        <SiteLink href={section.button.href} className={buttonClasses("solid", `group/arrow focus-visible:outline-current ${width}`)}>
          <span>
            <ArrowLabel spaced>{section.button.label}</ArrowLabel>
          </span>
        </SiteLink>
      )}
      {phone &&
        (phoneAs === "link" ? (
          <a href={toTelHref(phone)} aria-label={`${ctx.site.ui.callPrefix} ${phone}`} className={`group/phone flex items-center gap-3 py-2 text-[17px] font-bold ${tone === "dark" ? "text-white" : "text-heading"}`}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-[3px] border-[1.5px] transition-colors ${tone === "dark" ? "border-white/50 group-hover/phone:border-white" : "border-heading/30 group-hover/phone:border-heading"}`}>
              <Icon name="Phone" className="h-5 w-5" />
            </span>
            <span className="underline-offset-4 group-hover/phone:underline">{phone}</span>
          </a>
        ) : (
          <a href={toTelHref(phone)} aria-label={`${ctx.site.ui.callPrefix} ${phone}`} className={buttonClasses(tone === "dark" ? "on-primary" : "outline", `gap-3 ${width}`)}>
            <Icon name="Phone" className="h-5 w-5" />
            {phone}
          </a>
        ))}
    </div>
  );
}

const headingType = "animate-rise font-extrabold leading-[1.02] tracking-[-0.02em] [animation-delay:300ms]";

// --- 0. The text over the photo near the bottom left (the first version).
function PhotoHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight}`}>
      <Backdrop section={section} shade="bg-gradient-to-tr from-black/75 via-black/40 to-black/10" />
      <div className="mx-auto mt-auto w-full max-w-content px-4 pb-12 sm:px-6 sm:pb-16 lg:my-auto lg:px-8 lg:pb-0 lg:pt-[8svh]">
        <Eyebrow text={section.eyebrow} className="text-white/85" />
        <h1 className={`mt-4 max-w-[12em] text-[38px] text-white sm:text-[56px] lg:mt-6 xl:text-[68px] ${headingType}`}>{section.heading}</h1>
        <Actions section={section} ctx={ctx} />
      </div>
    </section>
  );
}

// --- 1. Center: everything centred on the photo, the eyebrow between two short sand lines.
function CenterHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight} justify-center`}>
      <Backdrop section={section} shade="bg-[radial-gradient(ellipse_at_center,rgba(10,14,40,0.72),rgba(10,14,40,0.45))]" />
      <div className="mx-auto w-full max-w-[920px] px-4 py-16 text-center sm:px-6">
        {section.eyebrow && (
          <div className="flex animate-rise items-center justify-center gap-4 [animation-delay:150ms]">
            <span aria-hidden="true" className="hidden h-[2px] w-12 bg-accent sm:block" />
            <p className="text-tag uppercase text-accent lg:text-[14px]">{section.eyebrow}</p>
            <span aria-hidden="true" className="hidden h-[2px] w-12 bg-accent sm:block" />
          </div>
        )}
        <h1 className={`mt-5 text-[40px] text-white sm:text-[60px] lg:mt-7 xl:text-[76px] ${headingType}`}>{section.heading}</h1>
        <Actions section={section} ctx={ctx} className="justify-center" />
      </div>
    </section>
  );
}

// --- 2. Panel: a block of the primary colour down the left side over the photo, the buttons stacked in it.
function PanelHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight} justify-end lg:justify-stretch`}>
      <Backdrop section={section} shade="bg-gradient-to-t from-black/40 to-transparent lg:bg-none" />
      <div className="flex flex-1 items-end lg:items-stretch">
        <div className="w-full animate-rise border-t-[6px] border-accent bg-primary/[0.82] px-5 py-10 [animation-delay:100ms] sm:px-10 lg:flex lg:w-[min(46%,640px)] lg:flex-col lg:justify-center lg:border-r-[6px] lg:border-t-0 lg:py-16 lg:pl-[max(2rem,calc((100vw-1140px)/2+2rem))] lg:pr-14 backdrop-blur-sm">
          <Eyebrow text={section.eyebrow} className="text-accent" />
          <h1 className={`mt-4 text-[36px] text-on-primary sm:text-[48px] lg:mt-6 xl:text-[56px] ${headingType}`}>{section.heading}</h1>
          <Actions section={section} ctx={ctx} stacked className="max-w-sm" />
        </div>
      </div>
    </section>
  );
}

// --- 3. Card: a white card on the right of the photo with a sand top edge, the phone as a link beside the button.
function CardHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight} justify-end lg:justify-center`}>
      <Backdrop section={section} shade="bg-gradient-to-l from-black/30 to-transparent" />
      <div className="mx-auto flex w-full max-w-content justify-end px-3 pb-3 sm:px-6 sm:pb-8 lg:px-8 lg:pb-0">
        <div className="w-full max-w-[560px] animate-rise rounded-[4px] border-t-[6px] border-accent bg-card p-6 shadow-2xl [animation-delay:100ms] sm:p-10">
          <Eyebrow text={section.eyebrow} className="text-primary" />
          <h1 className={`mt-3 text-[32px] text-heading sm:text-[44px] lg:text-[50px] ${headingType}`}>{section.heading}</h1>
          <Actions section={section} ctx={ctx} phoneAs="link" tone="light" />
        </div>
      </div>
    </section>
  );
}

// --- 4. Tiles: a very large heading low on the photo, and a row of three large blocks along its foot – the quote, the
// phone and the products.
function TilesHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  const { phone } = ctx.site.company;
  const tile = "group/tile flex min-h-[84px] items-center justify-between gap-4 px-5 py-5 text-label uppercase transition-colors sm:px-8 lg:min-h-[112px]";
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight}`}>
      <Backdrop section={section} shade="bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
      <div className="mx-auto mt-auto w-full max-w-content px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-14">
        <Eyebrow text={section.eyebrow} className="text-accent" />
        <h1 className={`mt-4 max-w-[11em] text-[44px] text-white sm:text-[68px] lg:mt-6 xl:text-[92px] ${headingType}`}>{section.heading}</h1>
      </div>
      <div className="grid animate-rise [animation-delay:450ms] sm:grid-cols-3">
        {section.button.label && (
          <SiteLink href={section.button.href} className={`${tile} bg-button text-button-text hover:bg-button-hover`}>
            {section.button.label}
            <Icon name="ArrowRight" className="h-6 w-6 shrink-0 transition-transform group-hover/tile:translate-x-1" />
          </SiteLink>
        )}
        {phone && (
          <a href={toTelHref(phone)} aria-label={`${ctx.site.ui.callPrefix} ${phone}`} className={`${tile} bg-primary text-on-primary hover:bg-secondary`}>
            {phone}
            <Icon name="Phone" className="h-6 w-6 shrink-0" />
          </a>
        )}
        <SiteLink href="/produkter" className={`${tile} bg-white/10 text-white backdrop-blur-md hover:bg-white/20`}>
          Se alla produkter
          <Icon name="ArrowRight" className="h-6 w-6 shrink-0 transition-transform group-hover/tile:translate-x-1" />
        </SiteLink>
      </div>
    </section>
  );
}

// --- 5. Info bar: the text high on the photo, and a bar of the primary colour along its foot with the company's facts.
function InfobarHero({ section, ctx }: { section: Hero; ctx: Ctx }) {
  return (
    <section id={section.anchor || undefined} className={`${sectionBase} ${fullHeight}`}>
      <Backdrop section={section} shade="bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
      <div className="mx-auto w-full max-w-content px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-[12svh]">
        <Eyebrow text={section.eyebrow} className="text-accent" />
        <h1 className={`mt-4 max-w-[13em] text-[38px] text-white sm:text-[56px] lg:mt-6 xl:text-[64px] ${headingType}`}>{section.heading}</h1>
        <Actions section={section} ctx={ctx} phoneAs="link" />
      </div>
      <div className="mt-auto bg-primary">
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
