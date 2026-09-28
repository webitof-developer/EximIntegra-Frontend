"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Helper to scroll to hash target if it exists
    const tryScrollToHash = (hash: string) => {
      if (!hash) return;
      try {
        const elem = document.querySelector(hash);
        if (elem && lenisRef.current) {
          lenisRef.current.scrollTo(elem as HTMLElement, { offset: -70 });
        }
      } catch {
        // ignore invalid selectors
      }
    };

    // Auto-scroll on mount if URL contains a hash (e.g. navigated from /pricing to /#features)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      const timers = [
        setTimeout(() => tryScrollToHash(hash), 60),
        setTimeout(() => tryScrollToHash(hash), 200),
        setTimeout(() => tryScrollToHash(hash), 500),
      ];
      return () => {
        timers.forEach(clearTimeout);
        cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
      };
    }

    // Intercept in-page anchor clicks (#interactive-demo, /#features, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      let hash = "";
      if (href.startsWith("#") && href.length > 1) {
        hash = href;
      } else if (href.startsWith("/#") && href.length > 2) {
        hash = href.substring(1);
      }

      if (hash) {
        try {
          const elem = document.querySelector(hash);
          if (elem) {
            // Target element is present on this page, perform smooth scroll!
            e.preventDefault();
            lenis.scrollTo(elem as HTMLElement, { offset: -70 });
            window.history.pushState(null, "", hash);
          }
          // If element is not on this page (e.g. on /pricing), allow normal Next.js navigation to /#section
        } catch {
          // invalid querySelector fallback
        }
      }
    };

    const handleHashChange = () => {
      if (window.location.hash) {
        tryScrollToHash(window.location.hash);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("hashchange", handleHashChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
