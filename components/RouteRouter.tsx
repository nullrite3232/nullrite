"use client";

import { useEffect } from "react";
import { useRitual } from "@/components/RitualContext";
import { ASSETS } from "@/lib/siteConfig";

const ROUTE_HASHES = ["#/collection", "#/gate", "#/docs"];

/**
 * v15 EXACT port — simple front-end routing for distinct pages.
 * Mirrors the routing block of /home/ubuntu/v15_ref/app.js 1:1.
 */
export function RouteRouter() {
  const { open } = useRitual();

  useEffect(() => {
    const pages: Record<string, HTMLElement | null> = {
      collection: document.getElementById("collectionPage"),
      gate: document.getElementById("gatePage"),
      docs: document.getElementById("docsPage"),
    };
    const navLinks = Array.from(
      document.querySelectorAll<HTMLElement>(".main-nav a[data-nav]")
    );

    const closeRoutePage = (updateHash = true) => {
      Object.values(pages).forEach((page) => {
        page?.classList.remove("active");
        page?.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("route-open");
      navLinks.forEach((link) =>
        link.classList.toggle("active", link.dataset.nav === "home")
      );
      if (
        updateHash &&
        location.hash &&
        ROUTE_HASHES.includes(location.hash)
      ) {
        history.replaceState(null, "", location.pathname + location.search + "#top");
      }
    };

    const openRoutePage = (name: string, updateHash = true) => {
      if (!pages[name]) return;
      Object.entries(pages).forEach(([key, page]) => {
        const isActive = key === name;
        page?.classList.toggle("active", isActive);
        page?.setAttribute("aria-hidden", isActive ? "false" : "true");
        if (isActive && page) page.scrollTop = 0;
      });
      document.body.classList.add("route-open");
      navLinks.forEach((link) =>
        link.classList.toggle("active", link.dataset.nav === name)
      );
      if (updateHash)
        history.replaceState(null, "", location.pathname + location.search + "#/" + name);
    };

    const onNavClick = (e: Event) => {
      const link = e.currentTarget as HTMLElement;
      const target = link.dataset.nav;
      if (target === "home") {
        e.preventDefault();
        closeRoutePage(false);
        history.replaceState(null, "", location.pathname + location.search + "#top");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (target === "mint") {
        e.preventDefault();
        closeRoutePage(false);
        history.replaceState(null, "", location.pathname + location.search + "#top");
        open(); // openSummoning
        return;
      }
      if (pages[target ?? ""]) {
        e.preventDefault();
        openRoutePage(target!, true);
      }
    };

    navLinks.forEach((link) => link.addEventListener("click", onNavClick));
    document
      .querySelectorAll<HTMLElement>("[data-close-page]")
      .forEach((btn) => btn.addEventListener("click", () => closeRoutePage(true)));

    // Reuse the current Gate video inside the dedicated sealed Gate page.
    const sourceGateVideo = document.querySelector<HTMLVideoElement>(
      ".gate-window video"
    );
    const gatePageVideo = document.getElementById(
      "gatePageVideo"
    ) as HTMLVideoElement | null;
    if (sourceGateVideo && gatePageVideo) {
      gatePageVideo.src = sourceGateVideo.src;
    }

    // Build a lightweight pre-reveal collection using the existing sealed Vessel art.
    const collectionGrid = document.getElementById("sealedCollectionGrid");
    const demoIds = [
      "0001", "0002", "0003", "0004", "0323", "0646",
      "0969", "1292", "1615", "1938", "2261", "3232",
    ];
    if (collectionGrid) {
      collectionGrid.innerHTML = demoIds
        .map(
          (id) => `
        <article class="sealed-card">
          <div class="sealed-card-media"><img src="${ASSETS.sealedVessel}" alt="Reveal Vessel Preview"></div>
          <div class="sealed-card-info"><strong>VESSEL #${id}</strong><span>Identity // Sealed</span></div>
        </article>`
        )
        .join("");
    }

    // Allow direct prototype hashes.
    if (location.hash === "#/collection") openRoutePage("collection", false);
    if (location.hash === "#/gate") openRoutePage("gate", false);
    if (location.hash === "#/docs") openRoutePage("docs", false);

    // Hash navigation (back/forward, manual hash edits) — v15 routing parity.
    const onHashChange = () => {
      const h = location.hash;
      if (h === "#/collection" || h === "#/gate" || h === "#/docs") {
        openRoutePage(h.slice(2), false);
      } else {
        closeRoutePage(false);
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      navLinks.forEach((link) => link.removeEventListener("click", onNavClick));
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [open]);

  return null;
}
