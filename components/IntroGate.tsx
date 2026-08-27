"use client";

import { useEffect, useRef } from "react";
import { ASSETS } from "@/lib/siteConfig";

/**
 * v15 EXACT port — dual-video seam crossfade + mouse parallax + enter transition.
 * Mirrors /home/ubuntu/v15_ref/app.js behavior 1:1.
 */
export function IntroGate({ onEnter }: { onEnter: () => void }) {
  const introRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const loopARef = useRef<HTMLVideoElement>(null);
  const loopBRef = useRef<HTMLVideoElement>(null);

  // keep the latest onEnter without re-running the effect
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  useEffect(() => {
    const intro = introRef.current;
    const introMedia = mediaRef.current;
    const loopA = loopARef.current;
    const loopB = loopBRef.current;
    if (!intro || !introMedia || !loopA || !loopB) return;

    let activeLoop: HTMLVideoElement = loopA;
    let standbyLoop: HTMLVideoElement = loopB;
    let seamBusy = false;
    const CROSSFADE = 0.75;

    const safePlay = (v: HTMLVideoElement) => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    // prepareLoop
    [loopA, loopB].forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = false;
    });
    loopA.currentTime = 0;
    loopA.classList.add("active");
    safePlay(loopA);

    const seamCrossfade = () => {
      if (intro.classList.contains("entering") || seamBusy) return;
      const d = activeLoop.duration;
      if (!Number.isFinite(d) || d <= 0) return;

      if (activeLoop.currentTime >= d - CROSSFADE) {
        seamBusy = true;
        standbyLoop.currentTime = 0;
        standbyLoop.classList.add("active");
        safePlay(standbyLoop);

        setTimeout(() => {
          activeLoop.classList.remove("active");
        }, 20);

        setTimeout(() => {
          activeLoop.pause();
          activeLoop.currentTime = 0;
          const old = activeLoop;
          activeLoop = standbyLoop;
          standbyLoop = old;
          seamBusy = false;
        }, CROSSFADE * 1000);
      }
    };
    const interval = setInterval(seamCrossfade, 70);

    const onMouseMove = (e: MouseEvent) => {
      if (intro.classList.contains("hidden") || intro.classList.contains("entering")) return;
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      introMedia.style.transform = `translate(${dx * 10}px,${dy * 6}px) scale(1.022)`;
    };
    const onMouseLeave = () => {
      if (!intro.classList.contains("entering")) introMedia.style.transform = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const onEnter = () => {
      introMedia.style.transform = "";
      intro.classList.add("entering");

      // Dashboard begins to appear while the viewport is fully inside the dark gate.
      setTimeout(() => {
        onEnterRef.current?.();
        window.scrollTo({ top: 0 });
      }, 980);

      setTimeout(() => {
        intro.classList.add("hidden");
        activeLoop.pause();
        standbyLoop.pause();
      }, 1320);
    };

    const btn = intro.querySelector<HTMLButtonElement>(".enter");
    btn?.addEventListener("click", onEnter);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      btn?.removeEventListener("click", onEnter);
      loopA.pause();
      loopB.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="intro" id="introGate" ref={introRef}>
      <div className="intro-media" id="introMedia" ref={mediaRef}>
        <video
          className="loop-layer active"
          id="loopA"
          ref={loopARef}
          src={ASSETS.gateLoop}
          autoPlay
          muted
          playsInline
        />
        <video
          className="loop-layer"
          id="loopB"
          ref={loopBRef}
          src={ASSETS.gateLoop}
          muted
          playsInline
        />
      </div>
      <div className="gate-warp" id="gateWarp" />
      <div className="gate-blackout" id="gateBlackout" />
      <div className="entry-flash" id="entryFlash" />
      <div className="intro-top">
        <span className="wordmark">NULL RITE</span>
        <span className="sys">SYSTEM // ENTRY</span>
      </div>
      <div className="enter-zone">
        <button className="enter" id="enterBtn">
          ENTER THE RITE
        </button>
        <small>THE GATE IS WATCHING</small>
      </div>
    </div>
  );
}
