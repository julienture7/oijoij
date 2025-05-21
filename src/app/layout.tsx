// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { NewSidebar } from "@/components/new-sidebar"; // Assuming this is the correct sidebar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Medical Dashboard",
  description: "Track and visualize your health data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen">
        <ClientBody>
          <div className="flex h-screen overflow-hidden">
            <NewSidebar />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </ClientBody>
      </body>
    </html>
  );
}