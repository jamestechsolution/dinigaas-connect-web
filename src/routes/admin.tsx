import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, LogOut, Package, Newspaper, Briefcase, Mail, Inbox, Plus, Trash2, Pencil, X, FileText,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Dinigaas" }] }),
  component: AdminPage,
});

type Tab = "content" | "products" | "news" | "careers" | "messages" | "subscribers";

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
            <nav className="mt-6 flex flex-wrap gap-2">
              {([
                ["content", FileText, "Site Content"],
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
