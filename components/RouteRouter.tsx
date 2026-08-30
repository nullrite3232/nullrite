"use client";

import { useEffect } from "react";
import { useRitual } from "@/components/RitualContext";

const ROUTE_HASHES = ["#/collection", "#/gate", "#/docs"];

/**
 * Lightweight front-end routing for distinct pages.
 *
 * Route page nodes can be replaced by React when protocol state changes
 * (for example PRE_LAUNCH Collection -> live Collection). Resolve the current
 * node at action time instead of holding a stale DOM reference from mount.
 */
export function RouteRouter() {
  const { open } = useRitual();

  useEffect(() => {
    const getPages = (): Record<string, HTMLElement | null> => ({
      collection: document.getElementById("collectionPage"),
      gate: document.getElementById("gatePage"),
      docs: document.getElementById("docsPage"),
    });

    const getPage = (name: string) => getPages()[name] ?? null;

    const navLinks = Array.from(
      document.querySelectorAll<HTMLElement>(".main-nav a[data-nav]")
    );

    const closeRoutePage = (updateHash = true) => {
      Object.values(getPages()).forEach((page) => {
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
      const pages = getPages();
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

    const openDocsSection = (sectionId: string, behavior: ScrollBehavior = "smooth") => {
      const article = document.getElementById(sectionId);
      if (!article || !sectionId.startsWith("docs-")) return false;

      openRoutePage("docs", false);
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#/docs"
      );

      document
        .querySelectorAll<HTMLAnchorElement>(".docs-index a[href^='#docs-']")
        .forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${sectionId}`;
          if (isCurrent) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });

      requestAnimationFrame(() => {
        article.scrollIntoView({ behavior, block: "start" });
      });
      return true;
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
      if (target && getPage(target)) {
        e.preventDefault();
        openRoutePage(target, true);
      }
    };

    navLinks.forEach((link) => link.addEventListener("click", onNavClick));

    // Route pages and RitualOverlay can be replaced/mounted dynamically.
    // Delegate close, docs anchors and post-mint actions so they always target live nodes.
    const onDelegatedClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const docsLink = target.closest<HTMLAnchorElement>(
        ".docs-index a[href^='#docs-']"
      );
      if (docsLink) {
        const href = docsLink.getAttribute("href");
        if (href?.startsWith("#docs-")) {
          event.preventDefault();
          openDocsSection(href.slice(1));
          return;
        }
      }

      if (target.closest("[data-close-page]")) {
        closeRoutePage(true);
        return;
      }

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

    // Allow direct hashes, including legacy direct docs anchors.
    const initialHash = location.hash;
    if (initialHash.startsWith("#docs-")) {
      openDocsSection(initialHash.slice(1), "auto");
    } else {
      if (initialHash === "#/collection") openRoutePage("collection", false);
      if (initialHash === "#/gate") openRoutePage("gate", false);
      if (initialHash === "#/docs") openRoutePage("docs", false);
    }

    const onHashChange = () => {
      const h = location.hash;
      if (h.startsWith("#docs-")) {
        openDocsSection(h.slice(1));
        return;
      }
      if (h === "#/collection" || h === "#/gate" || h === "#/docs") {
        openRoutePage(h.slice(2), false);
      } else {
        closeRoutePage(false);
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      navLinks.forEach((link) => link.removeEventListener("click", onNavClick));
      document.removeEventListener("click", onDelegatedClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [open]);

  return null;
}
