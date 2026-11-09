"use client";
import { useEffect, useRef } from "react";
// Columns render open (desktop, no-JS); on phones they collapse to save space.
export function FooterColumns({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(max-width: 800px)").matches)
      ref.current
        ?.querySelectorAll("details")
        .forEach((d) => d.removeAttribute("open"));
  }, []);
  return (
    <div className="footer-cols" ref={ref}>
      {children}
    </div>
  );
}
