import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Ginko Posters — Curated Art Prints from Independent Artists",
    template: "%s | Ginko Posters",
  },
  description:
    "Discover and collect premium art prints from independent artists. Every poster is produced on demand with high-quality materials and shipped directly to your door.",
  metadataBase: new URL("https://ginkoposters.com"),
  openGraph: {
    title: "Ginko Posters — Curated Art Prints from Independent Artists",
    description:
      "Discover and collect premium art prints from independent artists. Produced on demand, shipped to your door.",
    siteName: "Ginko Posters",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ginko Posters",
    description:
      "Curated art prints from independent artists. Premium quality, shipped to your door.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
