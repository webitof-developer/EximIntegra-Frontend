import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export const metadata: Metadata = {
  title: "EximIntegra — Trade Intelligence & Cross-Border Advisory",
  description:
    "Enterprise cross-border trade compliance, HS classification, landed cost, and duty intelligence platform.",
  icons: {
    icon: [
      { url: "/eximintegra-logo-mark.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/eximintegra-logo-mark.png",
    apple: "/eximintegra-logo-mark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-bg font-sans text-ink">
        <StoreProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
