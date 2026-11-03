"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis with optimized physics-based lerp for fluid gliding
    const lenis = new Lenis({
      lerp: 0.085, // Physics-based linear interpolation for fluid, cinematic glide
      smoothWheel: true,
      wheelMultiplier: 1.05, // Immediate, natural wheel response on desktop
      touchMultiplier: 1.8,
      syncTouch: false, // Maintain smooth native touch feel on phones/tablets
      respectReducedMotion: false, // Ensure smooth scroll is not disabled by OS flags
      autoResize: true, // Automatically recalculate dimensions on layout changes
      autoRaf: true, // High-performance internal requestAnimationFrame loop
      allowNestedScroll: true, // Allow inner scroll areas to scroll without freezing page
      anchors: false, // Disable Lenis internal click handler; we handle anchor scrolling directly with capture-phase intercept
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Helper to scroll to hash target smoothly
    const tryScrollToHash = (hash: string) => {
      if (!hash) return;
      try {
        const id = hash.replace(/^#/, "");
        const elem = document.getElementById(id) || document.querySelector(hash);
        if (elem && lenisRef.current) {
          lenisRef.current.scrollTo(elem as HTMLElement, {
            offset: -75,
            immediate: false,
          });
        }
      } catch {
        // ignore invalid selector syntax
      }
    };

    // 2. Handle initial hash on mount (e.g., direct navigation to /#features or /#interactive-demo)
    const timers: NodeJS.Timeout[] = [];
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      timers.push(setTimeout(() => tryScrollToHash(hash), 100));
      timers.push(setTimeout(() => tryScrollToHash(hash), 350));
      timers.push(setTimeout(() => tryScrollToHash(hash), 750));
    } else {
      // If navigating between pages without a hash, reset scroll position cleanly
      lenis.scrollTo(0, { immediate: true });
    }

    // 3. Keep dimensions synchronized as fonts, images, and interactive engines load
    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener("resize", handleResize);

    timers.push(setTimeout(() => lenis.resize(), 100));
    timers.push(setTimeout(() => lenis.resize(), 400));
    timers.push(setTimeout(() => lenis.resize(), 1200));

    // 4. Intercept in-page anchor clicks in CAPTURE phase so we intercept before Next.js Link router or native jumps
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      let hash = "";
      if (href.startsWith("#") && href.length > 1) {
        hash = href;
      } else if (href.startsWith("/#") && href.length > 2 && pathname === "/") {
        hash = href.substring(1);
      }

      if (hash) {
        try {
          const id = hash.replace(/^#/, "");
          const elem = document.getElementById(id) || document.querySelector(hash);
          if (elem && lenisRef.current) {
            e.preventDefault();
            e.stopPropagation();
            lenisRef.current.scrollTo(elem as HTMLElement, { offset: -75, immediate: false });
            window.history.pushState(null, "", hash);
          }
        } catch {
          // ignore querySelector fallback
        }
      }
    };

    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        tryScrollToHash(window.location.hash);
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("hashchange", handleHashChange);
      lenis.destroy();
      lenisRef.current = null;
      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
