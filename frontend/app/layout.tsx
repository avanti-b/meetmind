import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: "MeetMind — Enterprise Meeting Intelligence",
  description: "Convert raw meetings into persistent organizational intelligence using AI orchestration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-0 text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
