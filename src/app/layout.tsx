import type { Metadata } from "next";
import { Rubik_Mono_One, Space_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Rubik Mono One as pixel-style display font (Rubik Pixels isn't on Google Fonts, this is close)
const rubikMono = Rubik_Mono_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rubik-pixels",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Galib Muktasin | AI Engineer & Tech Strategist",
  description:
    "Breaking boundaries to craft designs that stand out and deliver results. Blending creativity with strategy, turning bold ideas into digital experiences that captivate and inspire.",
  keywords: [
    "AI Engineer",
    "Full-Stack Developer",
    "Tech Strategist",
    "React",
    "Next.js",
    "Machine Learning",
    "Portfolio",
  ],
  authors: [{ name: "Galib Muktasin" }],
  openGraph: {
    title: "Galib Muktasin | AI Engineer & Tech Strategist",
    description:
      "Breaking boundaries to craft designs that stand out and deliver results.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galib Muktasin | AI Engineer & Tech Strategist",
    description:
      "Breaking boundaries to craft designs that stand out and deliver results.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubikMono.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
