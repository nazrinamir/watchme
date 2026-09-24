import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { LunchWindow } from "@/components/lunch-window";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Watchme",
    template: "%s · Watchme",
  },
  description: "Monitor staff status.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <Suspense fallback={null}>
          <LunchWindow />
        </Suspense>
        <SiteHeader />
        <div className="flex-1">
          <Suspense
            fallback={
              <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <p className="text-sm text-stone-500">Loading…</p>
              </main>
            }
          >
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
