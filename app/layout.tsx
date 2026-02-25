import "@/styles/globals.css";
import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeInitScript from "@/components/ThemeInitScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700"],
});

import type { Viewport } from "next";

export const metadata = {
  title: "Seranova QR",
  description: "QR Kod ile Batch Takibi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1C18" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <ThemeInitScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
