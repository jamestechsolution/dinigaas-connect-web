import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { GraduationCap, Stethoscope, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Dinigaas Trading S.C." },
      { name: "description", content: "Our education, healthcare and trading services serving Sheger City, Ethiopia." },
      { property: "og:title", content: "Services — Dinigaas Trading S.C." },
      { property: "og:description", content: "Education, healthcare and trading services." },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  {
    Icon: GraduationCap,
    title: "Education",
    items: [
      "KG1 – KG3 early years program",
      "Primary education (Grade 1–4)",
      "Middle school (Grade 5–8)",
      "After-school enrichment & tutoring",
      "Parent engagement programs",
    ],
  },
  {
    Icon: Stethoscope,
    title: "Healthcare",
    items: [
      "General outpatient consultations",
      "Maternal & child health",
      "Vaccination & immunization",
      "Laboratory & diagnostic services",
      "Health education & community outreach",
    ],
  },
  {
    Icon: ShoppingBag,
    title: "Trading & Supply",
    items: [
      "Educational materials supply",
      "Medical supplies sourcing",
      "General trading operations",
      "Local distribution",
    ],
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">Services</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            What we offer the community.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            From classrooms to clinics, our services are designed to meet the everyday needs of
            families in Sheger City.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-3 lg:px-12">
          {SERVICES.map(({ Icon, title, items }) => (
            <article key={title} className="rounded-3xl border border-border bg-background p-8 shadow-card">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-6 font-serif text-2xl text-primary">{title}</h2>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-primary p-10 text-center text-primary-foreground md:p-16">
          <h2 className="font-serif text-4xl md:text-5xl">Ready to enroll or visit?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Reach out to our admissions or clinic team. We'd love to welcome you.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3 text-sm font-semibold text-primary hover:bg-primary-foreground/90"
          >
            Contact us <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
