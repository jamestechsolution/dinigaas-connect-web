import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dinigaas Trading S.C." },
      { name: "description", content: "Get in touch with Dinigaas Trading S.C. in Sheger City, Gefarsa Gujje Kella." },
      { property: "og:title", content: "Contact — Dinigaas Trading S.C." },
      { property: "og:description", content: "Get in touch with our team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not send message. Please try again.");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">Contact</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            We'd love to hear from you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Questions about admissions, healthcare or partnerships? Send us a message and our team
            will respond shortly.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-5 lg:px-12">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-primary">Get in touch</h2>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p className="text-muted-foreground">Sheger City, Gefarsa Gujje Kella, Ethiopia</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <a href="tel:+251923014132" className="text-muted-foreground hover:text-primary">+251 923 014 132</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a href="mailto:dinigaastrading@gmail.com" className="text-muted-foreground hover:text-primary">dinigaastrading@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Hours</p>
                  <p className="text-muted-foreground">Mon – Sat · 8:00 AM – 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-background p-8 shadow-card lg:col-span-3">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
            </div>
            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                maxLength={5000}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-light disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        required={!label.toLowerCase().includes("optional")}
      />
    </div>
  );
}
