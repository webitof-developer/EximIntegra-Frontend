"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  const pathname = usePathname();
  const isFullWidth = fullWidth || pathname?.startsWith("/admin");

  return (
    <div className="flex min-h-screen bg-bg antialiased text-ink font-sans">
      {/* 250px Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar />
        <main
          className={cn(
            "flex-1 py-6 w-full transition-all",
            isFullWidth
              ? "px-5 sm:px-8 max-w-none"
              : "px-6 sm:px-[34px] max-w-[1320px] mx-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
