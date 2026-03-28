"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface Props {
  children: React.ReactNode;
  delay?: number;           // ms stagger delay
  distance?: number;        // px slide-up distance (default 30)
  duration?: number;        // ms (default 600)
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedSection({
  children,
  delay = 0,
  distance = 30,
  duration = 600,
  style,
  className,
}: Props) {
  const [ref, visible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.12 });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        // prefers-reduced-motion handled via CSS media query below
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
