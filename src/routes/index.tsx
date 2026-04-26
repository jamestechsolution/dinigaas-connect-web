import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Stethoscope, Sparkles, Users, ShieldCheck, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { useSiteContent } from "@/hooks/use-site-content";
import { useSiteImages } from "@/hooks/use-site-images";
import heroImg from "@/assets/hero-students.jpg";
import healthImg from "@/assets/healthcare.jpg";
import schoolImg from "@/assets/school-building.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dinigaas Trading S.C. — Education & Healthcare in Sheger City" },
      {
        name: "description",
        content:
          "Quality KG1–Grade 8 education and community healthcare in Sheger City, Gefarsa Gujje Kella. Learn about our programs, services, and join our community.",
      },
      { property: "og:title", content: "Dinigaas Trading S.C." },
      { property: "og:description", content: "Education and healthcare for Sheger City." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { get } = useSiteContent("home");
  const { get: getImg } = useSiteImages();
  const heroSrc = getImg("home_hero", heroImg);
  const storySrc = getImg("home_story", schoolImg);
  const healthSrc = getImg("home_health", healthImg);
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-24 lg:px-12 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="mb-7 inline-flex animate-rise items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {get("home_hero_eyebrow", "Community Foundation")}
                </span>
              </div>
              <h1 className="animate-rise delay-100 text-balance font-serif text-5xl leading-[1.05] tracking-tight text-primary md:text-6xl lg:text-7xl">
                {get("home_hero_title", "Nurturing the future of Sheger City.")}
              </h1>
              <p className="animate-rise delay-200 mt-7 max-w-[48ch] text-pretty text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                {get(
                  "home_hero_subtitle",
                  "From the first steps of KG1 through Grade 8, and from routine checkups to specialized care — Dinigaas Trading S.C. delivers education and healthcare that transforms families and strengthens our community."
                )}
              </p>
              <div className="animate-rise delay-300 mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/services"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-lg"
                >
                  {get("home_cta_primary", "Our Services")}{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent"
                >
                  {get("home_cta_secondary", "Contact us")}
                </Link>
              </div>

              <dl className="animate-rise delay-400 mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {[
                  ["1,200+", "Students"],
                  ["KG1–G8", "Grade levels"],
                  ["24/7", "Care support"],
                ].map(([value, label]) => (
                  <div key={label} className="transition-transform hover:-translate-y-1">
                    <dt className="font-serif text-2xl font-medium text-primary md:text-3xl">{value}</dt>
                    <dd className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:col-span-6 xl:col-span-7">
              <div className="absolute -inset-6 -rotate-3 animate-float rounded-[3rem] bg-cotton" aria-hidden />
              <div className="zoom-img relative aspect-[4/5] animate-zoom-in overflow-hidden rounded-3xl ring-1 ring-black/5 sm:aspect-[16/11] lg:aspect-[4/5]">
                <img
                  src={heroSrc}
                  alt="Students of Dinigaas Trading S.C. school in Sheger City"
                  width={1280}
                  height={1600}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="lift animate-rise delay-500 absolute -bottom-6 -left-6 hidden max-w-[240px] rounded-2xl border border-border bg-background p-5 shadow-card sm:block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-clay/10">
                    <BookOpen className="size-3.5 text-clay" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Academics
                  </span>
                </div>
                <p className="text-sm leading-snug text-foreground">
                  KG1 to Grade 8 holistic curriculum focused on every learner.
                </p>
              </div>

              <div className="animate-float absolute -top-4 right-0 hidden max-w-[210px] rounded-2xl bg-primary p-5 text-primary-foreground shadow-card md:block lg:right-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
                  Healthcare
                </p>
                <p className="mt-1 font-serif text-lg italic">Care for our neighbors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">What we do</p>
            <h2 className="mt-3 font-serif text-4xl text-primary md:text-5xl">
              Two pillars, one community.
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: GraduationCap,
                title: "Primary Education",
                desc: "A modern KG1 to Grade 8 curriculum delivered by certified educators in a nurturing environment.",
              },
              {
                Icon: Stethoscope,
                title: "Healthcare Services",
                desc: "Outpatient care, maternal health, immunizations and diagnostics for the Gefarsa community.",
              },
              {
                Icon: Sparkles,
                title: "Trading & Supply",
                desc: "Reliable sourcing of essential goods that support our schools, clinics and the wider city.",
              },
            ].map(({ Icon, title, desc }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={i * 120}
                className="group lift rounded-3xl border border-border bg-background p-7"
              >
                <span className="mb-5 inline-grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-serif text-xl text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split feature */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-12">
          <Reveal className="relative">
            <div className="zoom-img overflow-hidden rounded-3xl shadow-card">
              <img
                src={storySrc}
                alt="Dinigaas school building"
                loading="lazy"
                width={1200}
                height={900}
                className="w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden animate-float rounded-2xl bg-primary p-5 text-primary-foreground shadow-card md:block">
              <p className="font-serif text-2xl">Est. in Sheger</p>
              <p className="text-xs text-primary-foreground/70">Gefarsa Gujje Kella</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">Our purpose</p>
            <h2 className="mt-3 font-serif text-4xl text-primary md:text-5xl">
              Building a thriving city, one family at a time.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Dinigaas Trading S.C. invests in what matters most: well-educated children and a
              healthy community. Our integrated approach ensures every family in Gefarsa Gujje
              Kella has access to opportunity.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                ["Holistic learning", "Academic, social and emotional growth from KG1 to Grade 8."],
                ["Accessible care", "Affordable, professional outpatient and maternal services."],
                ["Local impact", "We hire, source and reinvest in our neighborhood."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-4 transition-transform hover:translate-x-1">
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{t}</p>
                    <p className="text-sm text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Healthcare strip */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-12">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground/70">Healthcare</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">
              Compassionate care, close to home.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              Our clinic offers outpatient consultations, maternal and child health, immunizations
              and a fully equipped laboratory — all delivered by a warm, qualified team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/90 hover:shadow-lg"
              >
                Browse services
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-primary-foreground/25 px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/10"
              >
                Book a visit
              </Link>
            </div>
          </Reveal>
          <Reveal delay={150} className="zoom-img overflow-hidden rounded-3xl shadow-card">
            <img
              src={healthSrc}
              alt="Healthcare professional at the Dinigaas clinic"
              loading="lazy"
              width={1200}
              height={900}
              className="w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <Reveal className="lift mx-auto max-w-5xl rounded-3xl border border-border bg-cotton p-10 text-center md:p-16">
          <span className="mx-auto inline-grid size-14 animate-pulse-ring place-items-center rounded-full bg-primary/10 text-primary">
            <Users className="size-7" />
          </span>
          <h2 className="mt-4 font-serif text-4xl text-primary md:text-5xl">Join our community.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Enroll your child, book a healthcare visit, or partner with us to make Sheger City a
            better place to grow up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-lg"
            >
              Get in touch
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent"
            >
              About us
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
