import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteImageRow = {
  id: string;
  slot: string;
  label: string;
  image_url: string | null;
};

export function useSiteImages() {
  const [map, setMap] = useState<Record<string, string | null>>({});
  const [rows, setRows] = useState<SiteImageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("site_images").select("*");
      if (cancelled) return;
      const list = (data ?? []) as SiteImageRow[];
      setRows(list);
      setMap(Object.fromEntries(list.map((r) => [r.slot, r.image_url])));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const get = (slot: string, fallback: string) => map[slot] || fallback;
  return { get, map, rows, loading };
}
