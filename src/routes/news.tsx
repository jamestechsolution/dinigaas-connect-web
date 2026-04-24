import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — Dinigaas Trading S.C." },
      { name: "description", content: "Latest news and updates from Dinigaas Trading S.C." },
      { property: "og:title", content: "News — Dinigaas Trading S.C." },
      { property: "og:description", content: "Latest news and updates." },
    ],
  }),
  component: NewsPage,
});

type News = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  published_at: string;
};

function NewsPage() {
  const [items, setItems] = useState<News[] | null>(null);
  const [open, setOpen] = useState<News | null>(null);

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as News[]));
  }, []);

  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">News</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            Updates from our community.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {items === null ? (
            <div className="grid place-items-center py-24 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No news yet.</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {items.map((n) => (
                <article
                  key={n.id}
                  className="rounded-3xl border border-border bg-background p-8 shadow-card transition-all hover:-translate-y-1"
                >
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {new Date(n.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl text-primary">{n.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.excerpt}</p>
                  <button
                    onClick={() => setOpen(n)}
                    className="mt-5 text-sm font-semibold text-primary hover:underline"
                  >
                    Read more →
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={() => setOpen(null)}
        >
          <article
            className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl bg-background p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-muted-foreground">
              {new Date(open.published_at).toLocaleDateString()}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-primary">{open.title}</h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-foreground">{open.content}</p>
            <button
              onClick={() => setOpen(null)}
              className="mt-8 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Close
            </button>
          </article>
        </div>
      )}
    </SiteLayout>
  );
}
