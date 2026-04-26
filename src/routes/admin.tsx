import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, LogOut, Package, Newspaper, Briefcase, Mail, Inbox, Plus, Trash2, Pencil, X, FileText,
  ImageIcon, Navigation, Upload, MailCheck, AlertCircle, CheckCircle2, Send, MapPin,
} from "lucide-react";
import logo from "@/assets/dinigaas-logo.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Dinigaas" }] }),
  component: AdminPage,
});

type Tab = "content" | "images" | "nav" | "products" | "news" | "careers" | "messages" | "subscribers";

function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setUserId(null); setIsAdmin(false); navigate({ to: "/auth" });
      }
    });
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate({ to: "/auth" }); return; }
      setUserId(data.session.user.id);
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setLoading(false);
    })();
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function makeMeAdmin() {
    if (!userId) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) return toast.error("Could not grant admin: " + error.message);
    toast.success("You are now admin.");
    setIsAdmin(true);
  }

  async function logout() { await supabase.auth.signOut(); navigate({ to: "/" }); }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-cotton">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cotton">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link to="/" className="font-serif text-xl text-primary">Dinigaas Admin</Link>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        {!isAdmin ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-background p-8 text-center shadow-card">
            <h2 className="font-serif text-2xl text-primary">You're signed in.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              You don't have admin access yet. If you are the first user setting up this site, click below to grant yourself admin.
              For production, an existing admin should grant new users from the database.
            </p>
            <button onClick={makeMeAdmin} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-light">
              Grant me admin access
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-primary md:text-4xl">Dashboard</h1>
            <EmailForwardingStatus />
            <nav className="mt-6 flex flex-wrap gap-2">
              {([
                ["content", FileText, "Site Content"],
                ["images", ImageIcon, "Images"],
                ["nav", Navigation, "Navigation"],
                ["products", Package, "Products"],
                ["news", Newspaper, "News"],
                ["careers", Briefcase, "Careers"],
                ["messages", Inbox, "Messages"],
                ["subscribers", Mail, "Subscribers"],
              ] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    tab === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </nav>
            <div className="mt-8">
              {tab === "content" && <SiteContentAdmin />}
              {tab === "images" && <SiteImagesAdmin />}
              {tab === "nav" && <NavItemsAdmin />}
              {tab === "products" && <ProductsAdmin />}
              {tab === "news" && <NewsAdmin />}
              {tab === "careers" && <CareersAdmin />}
              {tab === "messages" && <MessagesAdmin />}
              {tab === "subscribers" && <SubscribersAdmin />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------ Reusable bits ------------ */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-background p-5 shadow-card">{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />;
}
function Btn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={"inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-light disabled:opacity-60 " + (p.className ?? "")}>{children}</button>;
}

/* ------------ Email forwarding status ------------ */
const FORWARD_EMAIL = "dinigaastrading@gmail.com";
type ForwardTest = { at: string; ok: boolean; detail: string };

function EmailForwardingStatus() {
  // Auto-forwarding requires a verified email domain. Until that's configured,
  // messages are saved to the dashboard inbox only.
  const configured = false;
  const [lastTest, setLastTest] = useState<ForwardTest | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dinigaas:lastForwardTest");
      if (raw) setLastTest(JSON.parse(raw) as ForwardTest);
    } catch { /* ignore */ }
  }, []);

  async function runTest() {
    setTesting(true);
    // Simulated probe: sends a test contact_message (admins can verify in inbox).
    // When forwarding is configured, this same insert will trigger the auto-forward.
    const { error } = await supabase.from("contact_messages").insert({
      name: "Forwarding Test",
      email: "test@dinigaas.local",
      subject: "[Test] Forwarding probe",
      message: `Probe sent at ${new Date().toISOString()}. If forwarding is configured, this should arrive at ${FORWARD_EMAIL}.`,
    });
    const result: ForwardTest = error
      ? { at: new Date().toISOString(), ok: false, detail: error.message }
      : { at: new Date().toISOString(), ok: true, detail: configured
          ? `Test message queued for ${FORWARD_EMAIL}.`
          : `Saved to dashboard inbox. Forwarding to ${FORWARD_EMAIL} is not configured yet.` };
    try { localStorage.setItem("dinigaas:lastForwardTest", JSON.stringify(result)); } catch { /* ignore */ }
    setLastTest(result);
    setTesting(false);
    if (error) toast.error("Test failed"); else toast.success("Test sent");
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            <MailCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Email forwarding</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Forward to <span className="font-medium text-foreground">{FORWARD_EMAIL}</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
              style={{ borderColor: configured ? "rgb(187 247 208)" : "rgb(253 230 138)", color: configured ? "rgb(21 128 61)" : "rgb(146 64 14)", background: configured ? "rgb(240 253 244)" : "rgb(255 251 235)" }}>
              {configured ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
              {configured ? "Configured" : "Not configured"}
            </div>
            {!configured && (
              <p className="mt-2 max-w-lg text-xs text-muted-foreground">
                New contact submissions are saved here in the Messages tab. To auto-forward each
                message to your inbox, set up a verified sender domain.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={runTest}
          disabled={testing}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Run test
        </button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last test</p>
        {lastTest ? (
          <div className="mt-2 flex items-start gap-2 text-sm">
            {lastTest.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            )}
            <div>
              <p className={lastTest.ok ? "text-foreground" : "text-destructive"}>
                {lastTest.ok ? "Success" : "Failed"} · {new Date(lastTest.at).toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{lastTest.detail}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No test run yet.</p>
        )}
      </div>
    </div>
  );
}

/* ------------ Logo preview ------------ */
type MaskMode = "contain" | "cover";

function LogoPreview() {
  const [mode, setMode] = useState<MaskMode>("contain");
  const fit = mode === "contain" ? "object-contain" : "object-cover";

  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-card animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-primary">Logo preview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See exactly how the current logo renders across the site, then upload a replacement to the
            <span className="font-medium text-foreground"> brand_logo</span> slot below.
          </p>
        </div>

        {/* Mask mode toggle */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline-block">
            Mask mode
          </span>
          <div
            role="tablist"
            aria-label="Logo mask mode"
            className="relative inline-flex items-center rounded-full border border-border bg-cotton p-1 shadow-inner"
          >
            <span
              aria-hidden
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-soft transition-transform duration-300 ease-out"
              style={{ transform: mode === "cover" ? "translateX(100%)" : "translateX(0%)" }}
            />
            {(["contain", "cover"] as MaskMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`relative z-10 min-w-[5rem] rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-200 ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div key={mode} className="mt-5 grid gap-4 animate-fade-in lg:grid-cols-3">
        {/* Header preview */}
        <div className="group rounded-2xl border border-border bg-cotton p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Header (48 × 48)</p>
          <div className="mt-3 rounded-xl bg-background p-3 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-border transition-transform duration-300 group-hover:scale-105">
                <img src={logo} alt="Logo header preview" width={48} height={48} className={`size-full ${fit} transition-all duration-300`} />
              </div>
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-2xl font-semibold text-primary">Dinigaas</span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-clay">Trading S.C.</span>
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {mode === "contain"
              ? "Whole mark visible, may show background around edges."
              : "Fills the circle — edges of the artwork get cropped."}
          </p>
        </div>

        {/* Footer preview */}
        <div className="group rounded-2xl border border-border bg-cotton p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Footer (64 × 64)</p>
          <div className="mt-3 rounded-xl bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-full bg-primary-foreground/95 p-1 transition-transform duration-300 group-hover:scale-105">
                <img src={logo} alt="Logo footer preview" width={64} height={64} className={`size-full rounded-full ${fit} transition-all duration-300`} />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-lg font-semibold">Dinigaas Trading S.C.</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-primary-foreground/70">Education • Healthcare</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {mode === "contain"
              ? "Mark padded inside the light backdrop — safest default."
              : "Mark fills the backdrop — best for full-bleed marks."}
          </p>
        </div>

        {/* Favicon / browser tab preview */}
        <div className="rounded-2xl border border-border bg-cotton p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Favicon (browser tab)</p>
          <div className="mt-3 overflow-hidden rounded-t-xl border border-b-0 border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="ml-2 flex max-w-[180px] items-center gap-2 truncate rounded-t-md bg-background px-2.5 py-1.5 text-[11px] text-foreground">
                <img src={logo} alt="Favicon preview" width={14} height={14} className="size-3.5 shrink-0 rounded-sm object-contain" />
                <span className="truncate">Dinigaas Trading S.C.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground">
              <MapPin className="size-3" /> dinigaas-trading.lovable.app
            </div>
          </div>
          <div className="rounded-b-xl border border-t-0 border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Favicon at 16px" width={16} height={16} className="size-4 rounded-sm object-contain" />
              <img src={logo} alt="Favicon at 32px" width={32} height={32} className="size-8 rounded-md object-contain" />
              <img src={logo} alt="Favicon at 64px" width={64} height={64} className="size-16 rounded-lg object-contain" />
              <span className="ml-auto text-[10px] text-muted-foreground">16 · 32 · 64 px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crop / size guidance */}
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-cotton/60 p-4">
        <p className="text-sm font-semibold text-foreground">Crop & sizing guidance</p>
        <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
          <li>• Upload a <span className="font-medium text-foreground">square</span> image (1:1). Recommended <span className="font-medium text-foreground">512 × 512 px</span> or larger.</li>
          <li>• Keep the mark centered with ~<span className="font-medium text-foreground">10% padding</span> — the header & footer apply a circular mask.</li>
          <li>• File format: <span className="font-medium text-foreground">PNG</span> (transparent) or JPG. Max <span className="font-medium text-foreground">5 MB</span>.</li>
          <li>• Avoid fine text in the logo — it will be unreadable at favicon size (16 px).</li>
          <li>• Use high contrast so the mark stays visible on the dark green footer.</li>
          <li>• To replace the favicon globally, upload to the <span className="font-medium text-foreground">brand_logo</span> slot below.</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------ Products ------------ */
type Product = { id: string; name: string; category: string; description: string; image_url: string | null; featured: boolean };
function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const load = () => supabase.from("products").select("*").order("created_at",{ascending:false}).then(({data}) => setItems((data ?? []) as Product[]));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.name || !editing?.category || !editing?.description) return toast.error("All fields required");
    const payload = { name: editing.name, category: editing.category, description: editing.description, image_url: editing.image_url || null, featured: !!editing.featured };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }
  return (
    <div className="space-y-4">
      <Btn onClick={() => setEditing({ name:"", category:"Education", description:"", featured:false })}><Plus className="size-4"/>Add product</Btn>
      <div className="grid gap-3">
        {items.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-clay">{p.category}{p.featured ? " · Featured" : ""}</p>
                <h3 className="mt-1 font-serif text-lg text-primary">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="rounded-full p-2 hover:bg-accent"><Pencil className="size-4"/></button>
                <button onClick={() => remove(p.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4"/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit product" : "New product"}>
          <div className="space-y-3">
            <Input placeholder="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/>
            <Input placeholder="Category (e.g. Education, Healthcare)" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}/>
            <Textarea placeholder="Description" rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/>
            <Input placeholder="Image URL (optional)" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}/>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}/> Featured</label>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------ News ------------ */
type News = { id: string; title: string; slug: string; excerpt: string; content: string; image_url: string | null; published: boolean };
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80); }
function NewsAdmin() {
  const [items, setItems] = useState<News[]>([]);
  const [editing, setEditing] = useState<Partial<News> | null>(null);
  const load = () => supabase.from("news").select("*").order("published_at",{ascending:false}).then(({data}) => setItems((data ?? []) as News[]));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.excerpt || !editing?.content) return toast.error("All fields required");
    const slug = editing.slug || slugify(editing.title);
    const payload = { title: editing.title, slug, excerpt: editing.excerpt, content: editing.content, image_url: editing.image_url || null, published: editing.published ?? true };
    const { error } = editing.id
      ? await supabase.from("news").update(payload).eq("id", editing.id)
      : await supabase.from("news").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }
  return (
    <div className="space-y-4">
      <Btn onClick={() => setEditing({ title:"", excerpt:"", content:"", published:true })}><Plus className="size-4"/>Add article</Btn>
      <div className="grid gap-3">
        {items.map((n) => (
          <Card key={n.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-primary">{n.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{n.excerpt}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.published ? "Published" : "Draft"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(n)} className="rounded-full p-2 hover:bg-accent"><Pencil className="size-4"/></button>
                <button onClick={() => remove(n.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4"/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit article" : "New article"}>
          <div className="space-y-3">
            <Input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}/>
            <Input placeholder="Excerpt" value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}/>
            <Textarea placeholder="Content" rows={6} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })}/>
            <Input placeholder="Image URL (optional)" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}/>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })}/> Published</label>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------ Careers ------------ */
type Job = { id: string; title: string; department: string; location: string; type: string; description: string; requirements: string; active: boolean };
function CareersAdmin() {
  const [items, setItems] = useState<Job[]>([]);
  const [editing, setEditing] = useState<Partial<Job> | null>(null);
  const load = () => supabase.from("careers").select("*").order("created_at",{ascending:false}).then(({data}) => setItems((data ?? []) as Job[]));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.department || !editing?.description || !editing?.requirements) return toast.error("All fields required");
    const payload = {
      title: editing.title, department: editing.department,
      location: editing.location || "Sheger City, Gefarsa Gujje Kella",
      type: editing.type || "Full-time",
      description: editing.description, requirements: editing.requirements,
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("careers").update(payload).eq("id", editing.id)
      : await supabase.from("careers").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this job?")) return;
    const { error } = await supabase.from("careers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }
  return (
    <div className="space-y-4">
      <Btn onClick={() => setEditing({ title:"", department:"", description:"", requirements:"", active:true })}><Plus className="size-4"/>Add job</Btn>
      <div className="grid gap-3">
        {items.map((j) => (
          <Card key={j.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-primary">{j.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{j.department} · {j.location} · {j.type} · {j.active ? "Active" : "Inactive"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(j)} className="rounded-full p-2 hover:bg-accent"><Pencil className="size-4"/></button>
                <button onClick={() => remove(j.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4"/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit job" : "New job"}>
          <div className="space-y-3">
            <Input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}/>
            <Input placeholder="Department" value={editing.department ?? ""} onChange={(e) => setEditing({ ...editing, department: e.target.value })}/>
            <Input placeholder="Location" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}/>
            <Input placeholder="Type (Full-time, Part-time, ...)" value={editing.type ?? ""} onChange={(e) => setEditing({ ...editing, type: e.target.value })}/>
            <Textarea placeholder="Description" rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/>
            <Textarea placeholder="Requirements" rows={4} value={editing.requirements ?? ""} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}/>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}/> Active</label>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------ Messages ------------ */
type Msg = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; read: boolean; created_at: string };
function MessagesAdmin() {
  const [items, setItems] = useState<Msg[]>([]);
  const load = () => supabase.from("contact_messages").select("*").order("created_at",{ascending:false}).then(({data}) => setItems((data ?? []) as Msg[]));
  useEffect(() => { load(); }, []);
  async function toggleRead(m: Msg) {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id); load();
  }
  return (
    <div className="grid gap-3">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      {items.map((m) => (
        <Card key={m.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg text-primary">{m.subject}</h3>
                {!m.read && <span className="rounded-full bg-clay/15 px-2 py-0.5 text-[10px] font-bold uppercase text-clay">New</span>}
              </div>
              <p className="text-xs text-muted-foreground">From {m.name} · {m.email}{m.phone ? " · " + m.phone : ""} · {new Date(m.created_at).toLocaleString()}</p>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground">{m.message}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => toggleRead(m)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">{m.read ? "Mark unread" : "Mark read"}</button>
              <button onClick={() => remove(m.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10 self-end"><Trash2 className="size-4"/></button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------ Subscribers ------------ */
type Sub = { id: string; email: string; created_at: string };
function SubscribersAdmin() {
  const [items, setItems] = useState<Sub[]>([]);
  const load = () => supabase.from("newsletter_subscribers").select("*").order("created_at",{ascending:false}).then(({data}) => setItems((data ?? []) as Sub[]));
  useEffect(() => { load(); }, []);
  async function remove(id: string) {
    if (!confirm("Remove subscriber?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id); load();
  }
  return (
    <div className="grid gap-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No subscribers yet.</p>}
      {items.map((s) => (
        <Card key={s.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{s.email}</p>
              <p className="text-xs text-muted-foreground">Subscribed {new Date(s.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => remove(s.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4"/></button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------ Site Content (homepage + about copy) ------------ */
type ContentRow = { id: string; key: string; value: string; label: string; section: string; multiline: boolean; sort_order: number };
function SiteContentAdmin() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("site_content").select("*").order("section").order("sort_order");
    const list = (data ?? []) as ContentRow[];
    setRows(list);
    setDrafts(Object.fromEntries(list.map((r) => [r.key, r.value])));
  };
  useEffect(() => { load(); }, []);

  async function save(row: ContentRow) {
    setSavingKey(row.key);
    const { error } = await supabase.from("site_content").update({ value: drafts[row.key] ?? "" }).eq("id", row.id);
    setSavingKey(null);
    if (error) return toast.error(error.message);
    toast.success(`Saved: ${row.label}`);
    load();
  }

  const grouped = rows.reduce<Record<string, ContentRow[]>>((acc, r) => {
    (acc[r.section] ??= []).push(r); return acc;
  }, {});
  const sectionTitle: Record<string, string> = { home: "Homepage", about: "About page" };

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">Edit the text shown on the homepage and about page. Changes appear instantly on the public site.</p>
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section} className="space-y-3">
          <h2 className="font-serif text-xl text-primary">{sectionTitle[section] ?? section}</h2>
          {items.map((r) => {
            const dirty = (drafts[r.key] ?? "") !== r.value;
            return (
              <Card key={r.id}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">{r.label}</label>
                {r.multiline ? (
                  <Textarea rows={4} value={drafts[r.key] ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: e.target.value })} />
                ) : (
                  <Input value={drafts[r.key] ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: e.target.value })} />
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "Saved"}</span>
                  <Btn disabled={!dirty || savingKey === r.key} onClick={() => save(r)}>
                    {savingKey === r.key ? <Loader2 className="size-4 animate-spin"/> : "Save"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ------------ Site Images (media library) ------------ */
type ImageRow = { id: string; slot: string; label: string; image_url: string | null };
type MediaFile = { name: string; url: string };

function SiteImagesAdmin() {
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [picker, setPicker] = useState<ImageRow | null>(null);

  const loadRows = async () => {
    const { data } = await supabase.from("site_images").select("*").order("label");
    setRows((data ?? []) as ImageRow[]);
  };
  const loadFiles = async () => {
    const { data } = await supabase.storage.from("site_media").list("", { sortBy: { column: "created_at", order: "desc" } });
    const list = (data ?? []).filter((f) => f.name && !f.name.startsWith("."));
    const enriched = list.map((f) => ({
      name: f.name,
      url: supabase.storage.from("site_media").getPublicUrl(f.name).data.publicUrl,
    }));
    setFiles(enriched);
  };
  useEffect(() => { loadRows(); loadFiles(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("site_media").upload(path, file, {
      contentType: file.type, upsert: false,
    });
    setUploading(false);
    e.target.value = "";
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    loadFiles();
  }

  async function assign(row: ImageRow, url: string | null) {
    const { error } = await supabase.from("site_images").update({ image_url: url }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`${row.label} updated`);
    setPicker(null);
    loadRows();
  }

  async function deleteFile(name: string) {
    if (!confirm("Delete this image from the library? Slots using it will fall back to the default.")) return;
    const { error } = await supabase.storage.from("site_media").remove([name]);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    loadFiles();
  }

  return (
    <div className="space-y-8">
      <LogoPreview />
      <div>
        <h2 className="font-serif text-xl text-primary">Image slots</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick which uploaded image appears in each slot. Changes go live instantly.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{r.label}</p>
              <div className="mt-2 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">Using default image</div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Btn onClick={() => setPicker(r)}><ImageIcon className="size-4"/>Change</Btn>
                {r.image_url && (
                  <button onClick={() => assign(r, null)} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
                    Reset to default
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl text-primary">Media library</h2>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-light ${uploading ? "opacity-60" : ""}`}>
            {uploading ? <Loader2 className="size-4 animate-spin"/> : <Upload className="size-4"/>}
            {uploading ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
          </label>
        </div>
        {files.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No images yet. Upload your first one.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((f) => (
              <div key={f.name} className="group relative overflow-hidden rounded-xl border border-border bg-background">
                <img src={f.url} alt={f.name} className="aspect-square w-full object-cover"/>
                <button onClick={() => deleteFile(f.name)} className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100">
                  <Trash2 className="size-3.5"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {picker && (
        <Modal onClose={() => setPicker(null)} title={`Choose image: ${picker.label}`}>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">Upload an image first using the button above.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {files.map((f) => (
                <button key={f.name} onClick={() => assign(picker, f.url)} className="group overflow-hidden rounded-xl border border-border ring-primary transition-all hover:ring-2">
                  <img src={f.url} alt={f.name} className="aspect-square w-full object-cover"/>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ------------ Navigation ------------ */
type NavRow = { id: string; label: string; path: string; sort_order: number; active: boolean };
function NavItemsAdmin() {
  const [items, setItems] = useState<NavRow[]>([]);
  const [editing, setEditing] = useState<Partial<NavRow> | null>(null);

  const load = () => supabase.from("nav_items").select("*").order("sort_order").then(({ data }) => setItems((data ?? []) as NavRow[]));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.label || !editing?.path) return toast.error("Label and path required");
    if (!editing.path.startsWith("/")) return toast.error("Path must start with /");
    const payload = {
      label: editing.label.trim(),
      path: editing.path.trim(),
      sort_order: Number(editing.sort_order ?? 0),
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("nav_items").update(payload).eq("id", editing.id)
      : await supabase.from("nav_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Remove this nav item?")) return;
    const { error } = await supabase.from("nav_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  }
  async function toggleActive(item: NavRow) {
    await supabase.from("nav_items").update({ active: !item.active }).eq("id", item.id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Edit the labels and target routes shown in the site header.</p>
        <Btn onClick={() => setEditing({ label: "", path: "/", sort_order: items.length + 1, active: true })}>
          <Plus className="size-4"/>Add link
        </Btn>
      </div>
      <div className="grid gap-2">
        {items.map((it) => (
          <Card key={it.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-serif text-lg text-primary">{it.label}</p>
                <p className="text-xs text-muted-foreground">{it.path} · order {it.sort_order} · {it.active ? "Visible" : "Hidden"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(it)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">
                  {it.active ? "Hide" : "Show"}
                </button>
                <button onClick={() => setEditing(it)} className="rounded-full p-2 hover:bg-accent"><Pencil className="size-4"/></button>
                <button onClick={() => remove(it.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4"/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit nav link" : "New nav link"}>
          <div className="space-y-3">
            <Input placeholder="Label (e.g. About)" value={editing.label ?? ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })}/>
            <Input placeholder="Path (e.g. /about)" value={editing.path ?? ""} onChange={(e) => setEditing({ ...editing, path: e.target.value })}/>
            <Input type="number" placeholder="Sort order" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}/>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}/>
              Visible in header
            </label>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-primary">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent"><X className="size-4"/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
