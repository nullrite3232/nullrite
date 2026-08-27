"use client";

import { useEffect } from "react";
import { useRitual } from "@/components/RitualContext";

const ROUTE_HASHES = ["#/collection", "#/gate", "#/docs"];

/**
 * Lightweight front-end routing for distinct pages.
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
      if (updateHash) {
        history.replaceState(
          null,
          "",
          location.pathname + location.search + "#/" + name
        );
      }
    };

    const openCollectionMode = (mode: "all" | "mine") => {
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#/collection"
      );
      openRoutePage("collection", false);
      window.dispatchEvent(
        new CustomEvent("nullrite:collection-mode", { detail: mode })
      );
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
        open();
        return;
      }
      if (pages[target ?? ""]) {
        e.preventDefault();
        openRoutePage(target!, true);
      }
    };

    navLinks.forEach((link) => link.addEventListener("click", onNavClick));
    const closeButtons = Array.from(
      document.querySelectorAll<HTMLElement>("[data-close-page]")
    );
    const onCloseClick = () => closeRoutePage(true);
    closeButtons.forEach((btn) => btn.addEventListener("click", onCloseClick));

    // RitualOverlay mounts dynamically. Delegate post-mint actions so the
    // confirmed Vessel appears in the correct Collection tab after close.
    const onDelegatedClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      if (target.closest("#returnAssembly")) {
        setTimeout(() => openCollectionMode("all"), 0);
      }
      if (target.closest("#viewVesselBtn")) {
        setTimeout(() => openCollectionMode("mine"), 0);
      }
    };
    document.addEventListener("click", onDelegatedClick);

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

    // Allow direct hashes.
    if (location.hash === "#/collection") openRoutePage("collection", false);
    if (location.hash === "#/gate") openRoutePage("gate", false);
    if (location.hash === "#/docs") openRoutePage("docs", false);

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
      closeButtons.forEach((btn) => btn.removeEventListener("click", onCloseClick));
      document.removeEventListener("click", onDelegatedClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [open]);

  return null;
}
