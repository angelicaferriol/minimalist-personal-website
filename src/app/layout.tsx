import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Angelica Ferriol",
  description: "This is Angelica's personal space in the internet.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Angelica Ferriol",
    description: "This is Angelica's personal space in the internet.",
    url: "https://angelicaferriol.com", // Fallback domain or let Next.js automatically resolve it
    siteName: "Angelica Ferriol",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 962, // 1200 / (4964 / 3980) = 962
        alt: "Angelica's personal logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Angelica Ferriol",
    description: "This is Angelica's personal space in the internet.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-2xl mx-auto w-full px-6 py-12 md:py-20 flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
