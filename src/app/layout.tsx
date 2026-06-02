import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Intelligence Platform",
  description: "Comprehensive website audit — SSL, DNS, security headers, SEO, performance, and more in one unified dashboard.",
  metadataBase: new URL("https://audit.jeremiahmagdael.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
            A project built by{" "}
            <a
              href="https://github.com/Queas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Jeremiah Magdael
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
