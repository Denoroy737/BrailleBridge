import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "BrailleBridge — English ↔ Braille (Grade 1 & 2 UEB)",
    template: "%s | BrailleBridge",
  },
  description:
    "Accurate bidirectional conversion between English and Grade 1 & Grade 2 Unified English Braille (UEB) with full contraction support.",
  keywords: ["braille", "UEB", "Grade 2 braille", "braille converter", "accessibility"],
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "BrailleBridge",
    description: "Grade 1 & 2 UEB Braille conversion.",
    siteName: "BrailleBridge",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f9" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.variable}>
        {/* Skip link targets the <main id="main-content"> rendered inside MainApp */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          richColors={false}
          toastOptions={{
            classNames: {
              toast:
                "bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700",
            },
          }}
        />
      </body>
    </html>
  );
}
