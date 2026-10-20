import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobTrail",
  description: "Track job applications and see why you match each role.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-3 text-sm">
            <Link href="/" className="font-semibold">
              JobTrail
            </Link>
            <Link href="/jobs" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
              Jobs
            </Link>
            <Link href="/resume" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
              Resume
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
