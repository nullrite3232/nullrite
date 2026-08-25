import "./globals.css";
import { Providers } from "./providers";
import { Layout } from "@/components/layout/Layout";

export const metadata = {
  title: "NULL RITE — 3,232 Vessels",
  description: "A dark cosmic ritual on Robinhood Chain. 3,232 Vessels will answer.",
  openGraph: {
    title: "NULL RITE — 3,232 Vessels",
    description: "A dark cosmic ritual on Robinhood Chain. 3,232 Vessels will answer.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-off antialiased">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}