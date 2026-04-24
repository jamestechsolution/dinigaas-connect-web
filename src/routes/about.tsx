import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Heart, Target, Eye, Users } from "lucide-react";
import schoolImg from "@/assets/school-building.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dinigaas Trading S.C." },
      { name: "description", content: "Our story, mission, vision and values. Based in Sheger City, Gefarsa Gujje Kella." },
      { property: "og:title", content: "About — Dinigaas Trading S.C." },
      { property: "og:description", content: "Our story, mission, vision and values." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">About us</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            A locally rooted company serving Sheger City.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Dinigaas Trading S.C. is a community-focused company headquartered in Gefarsa Gujje
            Kella. We invest in education and healthcare because we believe these are the
            foundations of every prosperous neighborhood.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-12">
          <img src={schoolImg} alt="Dinigaas campus" loading="lazy" width={1200} height={900} className="rounded-3xl object-cover shadow-card" />
          <div>
            <h2 className="font-serif text-3xl text-primary md:text-4xl">Our story</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Founded with a mission to uplift the families of Sheger City, Dinigaas began with a
              single school and grew to include healthcare and trading operations. Today we serve
              hundreds of students and patients every week.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We are proud to employ qualified teachers, nurses and professionals from our local
              community, ensuring our impact stays close to home.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: Target, title: "Mission", text: "Provide accessible quality education and healthcare to the families of Sheger City." },
              { Icon: Eye, title: "Vision", text: "A thriving community where every child learns and every family is healthy." },
              { Icon: Heart, title: "Values", text: "Care, integrity, excellence and community-first thinking in everything we do." },
            ].map(({ Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-border bg-background p-7">
                <Icon className="size-7 text-primary" />
                <h3 className="mt-4 font-serif text-2xl text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="font-serif text-3xl text-primary md:text-4xl">Leadership team</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            A dedicated group of educators, healthcare professionals and business leaders.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["General Manager", "Oversees operations and strategy"],
              ["Academic Director", "Leads our educational programs"],
              ["Medical Director", "Heads our healthcare division"],
              ["Operations Lead", "Manages trading and logistics"],
            ].map(([role, desc]) => (
              <article key={role} className="rounded-3xl border border-border bg-cotton p-6">
                <div className="grid h-32 place-items-center rounded-2xl bg-primary/10">
                  <Users className="size-10 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-primary">{role}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
