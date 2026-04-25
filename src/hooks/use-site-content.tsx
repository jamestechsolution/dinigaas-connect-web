import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentRow = {
  id: string;
  key: string;
  value: string;
  label: string;
  section: string;
  multiline: boolean;
  sort_order: number;
};

export function useSiteContent(section?: string) {
  const [map, setMap] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase.from("site_content").select("*").order("sort_order", { ascending: true });
      if (section) q = q.eq("section", section);
      const { data } = await q;
      if (cancelled) return;
      const list = (data ?? []) as SiteContentRow[];
      setRows(list);
      setMap(Object.fromEntries(list.map((r) => [r.key, r.value])));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [section]);

  const get = (key: string, fallback = "") => map[key] ?? fallback;
  return { get, map, rows, loading };
}
