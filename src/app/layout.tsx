import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoSage - AI-Powered Codebase Onboarding",
  description:
    "Instantly understand any GitHub repository with AI-generated onboarding guides and documentation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-zinc-950">
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
