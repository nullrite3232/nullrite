"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

const NAV_ITEMS = [
  { href: "/", label: "ASSEMBLY" },
  { href: "/mint", label: "SUMMONING" },
  { href: "/collection", label: "VESSELS" },
  { href: "/gate", label: "THE GATE" },
  { href: "/docs", label: "RECORD" },
  { href: "/verify", label: "VERIFY" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 wordmark"
            aria-label="NULL RITE Home"
          >
            <span className="font-mono tracking-widest text-sm text-acid">
              NULL
            </span>
            <span className="font-mono tracking-widest text-sm text-off">
              <b>RITE</b>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link px-3 py-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? "text-acid"
                    : "text-dim2 hover:text-off"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ConnectButton showBalance={false} />
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => window.open("https://x.com/nullrite3232", "_blank")}
            >
              X
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-dim2 hover:text-off hover:bg-panel2 transition-colors shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link px-3 py-3 rounded-md transition-colors ${
                  pathname === item.href
                    ? "text-acid bg-panel2"
                    : "text-dim2 hover:text-off hover:bg-panel2"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-line">
              <div className="w-full">
                <ConnectButton showBalance={false} />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={() => window.open("https://x.com/nullrite3232", "_blank")}
              >
                X / Twitter
              </Button>
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}