import "./globals.css";
import "./responsive-fixes.css";
import "./collection.css";
import "./phase-updates.css";
import "./docs-final.css";
import "./wallet.css";
import { Providers } from "./providers";
import { Layout } from "@/components/layout/Layout";

export const metadata = {
  title: "NULL RITE — 3232 Vessels",
  description: "A persistent onchain ritual on Robinhood Chain. 3232 Vessels will answer.",
  openGraph: {
    title: "NULL RITE — 3232 Vessels",
    description: "A persistent onchain ritual on Robinhood Chain. 3232 Vessels will answer.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
