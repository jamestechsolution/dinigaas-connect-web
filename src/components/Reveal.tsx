import type { ReactNode, ElementType, CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  style?: CSSProperties;
};

/**
 * Wrap any block to fade-in + rise the first time it enters the viewport.
 */
export function Reveal({ as: Tag = "div", children, className, delay = 0, style }: Props) {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${shown ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </Tag>
  );
}
