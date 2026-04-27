import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register a Student — Dinigaas Trading S.C." },
      {
        name: "description",
        content:
          "Parents can directly enroll their child at Dinigaas. Submit your student's details online and our admissions team will be in touch.",
      },
      { property: "og:title", content: "Register a Student — Dinigaas Trading S.C." },
      {
        property: "og:description",
        content: "Enroll your child online with Dinigaas Trading S.C.",
      },
    ],
  }),
  component: RegisterPage,
});

const GRADES = [
  "KG1",
  "KG2",
  "KG3",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
];

const schema = z.object({
  parent_name: z.string().trim().min(1, "Parent name is required").max(100),
  parent_email: z.string().trim().email("Valid email required").max(255),
  parent_phone: z.string().trim().min(5, "Phone is required").max(30),
  relationship: z.string().trim().min(1).max(50),
  student_first_name: z.string().trim().min(1, "Student first name is required").max(100),
  student_last_name: z.string().trim().min(1, "Student last name is required").max(100),
  student_date_of_birth: z.string().min(1, "Date of birth is required"),
  student_gender: z.string().min(1, "Gender is required").max(20),
  grade_applying_for: z.string().min(1, "Grade is required").max(50),
  previous_school: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const EMPTY: FormState = {
  parent_name: "",
  parent_email: "",
  parent_phone: "",
  relationship: "Parent",
  student_first_name: "",
  student_last_name: "",
  student_date_of_birth: "",
  student_gender: "",
  grade_applying_for: "",
  previous_school: "",
  address: "",
  notes: "",
};

function RegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("student_registrations").insert({
      parent_name: parsed.data.parent_name,
      parent_email: parsed.data.parent_email,
      parent_phone: parsed.data.parent_phone,
      relationship: parsed.data.relationship,
      student_first_name: parsed.data.student_first_name,
      student_last_name: parsed.data.student_last_name,
      student_date_of_birth: parsed.data.student_date_of_birth,
      student_gender: parsed.data.student_gender,
      grade_applying_for: parsed.data.grade_applying_for,
      previous_school: parsed.data.previous_school || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit registration. Please try again.");
      return;
    }
    toast.success("Registration submitted! Our admissions team will contact you shortly.");
    setForm(EMPTY);
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <section className="bg-cotton py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-light">
            Admissions
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-primary md:text-6xl">
            Register your child today.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Parents can enroll their child directly at Dinigaas. Fill out the form below and our
            admissions team will reach out to confirm next steps.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-5 lg:px-12">
          <aside className="lg:col-span-2">
            <div className="rounded-3xl border border-border bg-background p-8 shadow-card">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </span>
              <h2 className="mt-5 font-serif text-2xl text-primary">What happens next?</h2>
              <ul className="mt-5 space-y-4 text-sm text-foreground/80">
                {[
                  "We review your registration within 1–2 business days.",
                  "Our admissions team contacts you to schedule a visit.",
                  "Bring required documents on the visit day for placement.",
                  "Receive your child's offer letter and start date.",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Have questions? Visit our{" "}
                <Link to="/contact" className="font-semibold text-primary hover:underline">
                  contact page
                </Link>{" "}
                or call <span className="font-semibold">+251 923 014 132</span>.
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-background p-8 shadow-card lg:col-span-3"
          >
            <h2 className="font-serif text-2xl text-primary">Parent / Guardian</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Parent / Guardian name"
                value={form.parent_name}
                onChange={(v) => update("parent_name", v)}
              />
              <Field
                label="Email"
                type="email"
                value={form.parent_email}
                onChange={(v) => update("parent_email", v)}
              />
              <Field
                label="Phone"
                value={form.parent_phone}
                onChange={(v) => update("parent_phone", v)}
              />
              <SelectField
                label="Relationship"
                value={form.relationship}
                onChange={(v) => update("relationship", v)}
                options={["Parent", "Mother", "Father", "Guardian", "Other"]}
              />
            </div>

            <h2 className="mt-10 font-serif text-2xl text-primary">Student</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Student first name"
                value={form.student_first_name}
                onChange={(v) => update("student_first_name", v)}
              />
              <Field
                label="Student last name"
                value={form.student_last_name}
                onChange={(v) => update("student_last_name", v)}
              />
              <Field
                label="Date of birth"
                type="date"
                value={form.student_date_of_birth}
                onChange={(v) => update("student_date_of_birth", v)}
              />
              <SelectField
                label="Gender"
                value={form.student_gender}
                onChange={(v) => update("student_gender", v)}
                options={["", "Female", "Male", "Other"]}
                placeholder="Select gender"
              />
              <SelectField
                label="Grade applying for"
                value={form.grade_applying_for}
                onChange={(v) => update("grade_applying_for", v)}
                options={["", ...GRADES]}
                placeholder="Select grade"
              />
              <Field
                label="Previous school (optional)"
                value={form.previous_school ?? ""}
                onChange={(v) => update("previous_school", v)}
                required={false}
              />
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Home address (optional)
              </label>
              <input
                type="text"
                value={form.address ?? ""}
                onChange={(e) => update("address", e.target.value)}
                maxLength={300}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Notes for admissions (optional)
              </label>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => update("notes", e.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-light disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Submitting…" : (
                <>
                  Submit registration <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {submitted && (
              <p className="mt-4 text-sm text-primary">
                ✓ Your registration has been received. We will be in touch soon.
              </p>
            )}
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
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        required
      >
        {options.map((opt) =>
          opt === "" ? (
            <option key="__empty" value="">
              {placeholder ?? "Select…"}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
