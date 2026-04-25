import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavItem = {
  id: string;
  label: string;
  path: string;
  sort_order: number;
  active: boolean;
};

const FALLBACK: NavItem[] = [
  { id: "f1", label: "Home", path: "/", sort_order: 1, active: true },
  { id: "f2", label: "About", path: "/about", sort_order: 2, active: true },
  { id: "f3", label: "Services", path: "/services", sort_order: 3, active: true },
  { id: "f4", label: "Products", path: "/products", sort_order: 4, active: true },
  { id: "f5", label: "News", path: "/news", sort_order: 5, active: true },
  { id: "f6", label: "Careers", path: "/careers", sort_order: 6, active: true },
];

export function useNavItems() {
  const [items, setItems] = useState<NavItem[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("nav_items")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (cancelled || !data || data.length === 0) return;
      setItems(data as NavItem[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
