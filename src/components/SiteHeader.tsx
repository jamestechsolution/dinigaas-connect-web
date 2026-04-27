import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { useNavItems } from "@/hooks/use-nav-items";
import logo from "@/assets/dinigaas-logo.jpg";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const nav = useNavItems();

  return (
    <>
      <div className="bg-primary py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/85">
            <MapPin className="size-3.5" aria-hidden />
            Sheger City, Gefarsa Gujje Kella
          </p>
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/85 md:block">
            Education • Health • Mining • Agriculture • Commerce
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link to="/" className="flex items-center gap-3 leading-tight">
            <img
              src={logo}
              alt="Dinigaas Trading S.C. logo"
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-contain"
            />
            <span className="flex flex-col">
              <span className="font-serif text-2xl font-semibold text-primary">Dinigaas</span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
                Trading S.C.
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: item.path === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-light lg:inline-block"
            >
              Contact us
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-full p-2 text-primary lg:hidden"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
                  activeProps={{ className: "bg-accent text-primary" }}
                  activeOptions={{ exact: item.path === "/" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Contact us
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
