import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Programs & Products — Dinigaas Trading S.C." },
      { name: "description", content: "Browse our education programs, healthcare offerings and traded products." },
      { property: "og:title", content: "Programs & Products — Dinigaas Trading S.C." },
      { property: "og:description", content: "Our programs and offerings." },
    ],
  }),
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string | null;
  featured: boolean;
};

function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data ?? []) as Product[]));
  }, []);

  const categories = ["All", ...Array.from(new Set((products ?? []).map((p) => p.category)))];
  const filtered = (products ?? []).filter((p) => filter === "All" || p.category === filter);

  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">Programs & Products</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            Explore what we offer.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            From early years education to specialized healthcare programs, find the right fit for
            your family.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  filter === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {products === null ? (
            <div className="grid place-items-center py-24 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No items in this category yet.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <article key={p.id} className="overflow-hidden rounded-3xl border border-border bg-background shadow-card transition-all hover:-translate-y-1">
                  <div className="aspect-[16/10] overflow-hidden bg-cotton">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/10 to-clay/10">
                        <span className="font-serif text-3xl text-primary/40">{p.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-clay">{p.category}</p>
                    <h3 className="mt-2 font-serif text-xl text-primary">{p.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
