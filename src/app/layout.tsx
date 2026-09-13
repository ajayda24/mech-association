import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  icons: { icon: "/logo/mech-logo-256.png" },
};

export const viewport: Viewport = {
  themeColor: "#1a1d22",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
          General Sans — the reference's geometric grotesque. Served from
          Fontshare's CDN for now; self-host via next/font/local before launch
          to drop the extra DNS round trip.
        */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
        />
      </head>
      <body className="antialiased">
        <SmoothScroll>
          <Nav />
          {/*
            Sections run full-bleed and carry their own tone, so the page reads
            as alternating bands of material. No clipping wrapper here: an
            overflow ancestor would fight ScrollTrigger's position:fixed pins.
          */}
          <div id="top">
            <main>{children}</main>
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
