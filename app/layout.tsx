import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const metadata = {
  title: "NULL RITE — 3,232 Vessels",
  description: "A dark cosmic ritual on Robinhood Chain. 3,232 Vessels will answer.",
};

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/mint", label: "MINT" },
  { href: "/collection", label: "COLLECTION" },
  { href: "/gate", label: "GATE" },
  { href: "/docs", label: "DOCS" },
  { href: "/verify", label: "VERIFY" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/" className="wordmark">
              NULL <b>RITE</b>
            </Link>
            <nav className="main-nav">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="nav-link">
                  {n.label}
                </Link>
              ))}
            </nav>
            <ConnectButton />
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <span>NULL RITE // 3,232 VESSELS</span>
            <span>ROBINHOOD CHAIN // V1 WEB CONCEPT</span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
