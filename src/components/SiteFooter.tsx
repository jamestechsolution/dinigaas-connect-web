import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed — thank you!");
      else toast.error("Could not subscribe. Please try again.");
      return;
    }
    toast.success("Subscribed! Thank you for joining our newsletter.");
    setEmail("");
  }

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-serif text-3xl font-semibold">Dinigaas Trading S.C.</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/70">
              Education • Healthcare
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
              Nurturing the future of Sheger City through quality education from KG1 to Grade 8 and
              accessible healthcare for our community.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-serif text-lg">Visit us</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>Sheger City, Gefarsa Gujje Kella, Ethiopia</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href="tel:+251923014132" className="hover:text-primary-foreground">+251 923 014 132</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href="mailto:dinigaastrading@gmail.com" className="hover:text-primary-foreground">dinigaastrading@gmail.com</a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-serif text-lg">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["/about", "About"],
                ["/services", "Services"],
                ["/products", "Programs"],
                ["/news", "News"],
                ["/careers", "Careers"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-primary-foreground/75 transition-colors hover:text-primary-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-serif text-lg">Newsletter</h3>
            <p className="mt-4 text-sm text-primary-foreground/75">
              Get news about admissions, events and clinic updates.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/90 disabled:opacity-60"
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Dinigaas Trading S.C. All rights reserved.</p>
          <Link to="/admin" className="hover:text-primary-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
