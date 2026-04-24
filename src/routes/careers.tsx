import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Dinigaas Trading S.C." },
      { name: "description", content: "Open positions at Dinigaas Trading S.C. in Sheger City, Ethiopia." },
      { property: "og:title", content: "Careers — Dinigaas Trading S.C." },
      { property: "og:description", content: "Join our team in Sheger City." },
    ],
  }),
  component: CareersPage,
});

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
};

function CareersPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [open, setOpen] = useState<Job | null>(null);

  useEffect(() => {
    supabase
      .from("careers")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setJobs((data ?? []) as Job[]));
  }, []);

  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">Careers</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            Build a career with purpose.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Join a team that is shaping the future of Sheger City through education and healthcare.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          {jobs === null ? (
            <div className="grid place-items-center py-24 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No open positions right now. Check back soon!</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((j) => (
                <article
                  key={j.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-serif text-xl text-primary">{j.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Briefcase className="size-3.5" /> {j.department}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {j.location}</span>
                      <span className="rounded-full bg-clay/10 px-2 py-0.5 font-semibold text-clay">{j.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(j)}
                    className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-light sm:self-auto"
                  >
                    View role
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setOpen(null)}>
          <article
            className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl bg-background p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-3xl text-primary">{open.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {open.department} · {open.location} · {open.type}
            </p>

            <h3 className="mt-6 font-semibold text-foreground">About the role</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{open.description}</p>

            <h3 className="mt-6 font-semibold text-foreground">Requirements</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{open.requirements}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:careers@dinigaas.et?subject=${encodeURIComponent("Application: " + open.title)}`}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-light"
              >
                Apply via email
              </a>
              <button
                onClick={() => setOpen(null)}
                className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Close
              </button>
            </div>
          </article>
        </div>
      )}
    </SiteLayout>
  );
}
