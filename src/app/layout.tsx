import type { Metadata, Viewport } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Preloader } from "@/components/layout/Preloader";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { DevCredit } from "@/components/layout/DevCredit";
import { site } from "@/content/site";

/**
 * Brand wordmark face, self-hosted by next/font: the file is served from our
 * own origin, preloaded, and given a stable CSS variable. That removes a
 * third-party round trip and the layout shift a late-arriving display font
 * would cause on the loading screen.
 */
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

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
    <html lang="en" className={cinzel.variable}>
      <head>
        {/*
          General Sans for UI and body copy, from Fontshare. The brand face
          (Cinzel) is self-hosted by next/font above. Self-host General Sans via
          next/font/local before launch to drop this last round trip too.
        */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
        />
      </head>
      <body className="antialiased">
        <Preloader>
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
            {/*
              Sits outside #top and after the footer: it is fixed to the
              viewport rather than to the document, so it stays with the reader
              the whole way down and back up.
            */}
            <DevCredit />
          </SmoothScroll>
        </Preloader>
      </body>
    </html>
  );
}
