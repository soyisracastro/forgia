import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forgia — Tu entrenador de CrossFit con IA",
  description:
    "Genera WODs personalizados con inteligencia artificial. Calentamiento, fuerza, metcon y enfriamiento adaptados a tu nivel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-Q9GFWE720C" />
    </html>
  );
}
