import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll hook: returns a ref + a boolean that flips true the first
 * time the element enters the viewport. Use with the .reveal utility class.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px", ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, options]);

  return { ref, shown } as const;
}
