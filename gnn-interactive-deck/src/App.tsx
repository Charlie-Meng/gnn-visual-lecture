import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Maximize,
  MonitorPlay,
  RefreshCw,
  Rows3,
  X,
} from "lucide-react";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.esm.js";
import { hasNativeMathSlide, NativeMathSlide } from "./mathSlides";
import slideNotes from "./slide-notes.json";
import { SLIDES, slideImage, type LiveScene } from "./slides";
import { hasNativeStaticSlide, NativeStaticSlide } from "./staticSlides";

type RevealDeck = {
  initialize: () => Promise<void>;
  destroy: () => void;
  on: (event: string, listener: () => void) => void;
  off: (event: string, listener: () => void) => void;
  prev: () => void;
  next: () => void;
  slide: (horizontal: number, vertical?: number, fragment?: number) => void;
  getCurrentSlide: () => HTMLElement | null;
  getIndices: () => { h: number; v: number; f?: number };
};

function Notes({ children }: { children: React.ReactNode }) {
  return <aside className="notes">{children}</aside>;
}

function LiveLab({ scene }: { scene: LiveScene }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    frame?.contentWindow?.focus();
    frame?.contentWindow?.dispatchEvent(new Event("focus"));
  }, [loaded]);

  const connectKeyboard = () => {
    const frame = frameRef.current;
    const doc = frame?.contentWindow?.document;
    if (!doc || doc.documentElement.dataset.deckKeyboard === "ready") {
      setLoaded(true);
      return;
    }

    doc.documentElement.dataset.deckKeyboard = "ready";
    doc.addEventListener("keydown", (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, input, select, textarea, [role='button']")) return;
      if (["ArrowRight", "PageDown"].includes(event.key)) window.parent.postMessage({ type: "deck:navigate", direction: 1 }, "*");
      if (["ArrowLeft", "PageUp"].includes(event.key)) window.parent.postMessage({ type: "deck:navigate", direction: -1 }, "*");
      if (event.key.toLowerCase() === "l" || event.key === "Escape") window.parent.postMessage({ type: "deck:close-live" }, "*");
    });

    frame.style.visibility = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      frame.style.visibility = "visible";
      setLoaded(true);
    }));
  };

  return (
    <div className="live-layer" style={{ "--model-accent": scene.accent } as React.CSSProperties}>
      <div className={`live-loader${loaded ? " is-hidden" : ""}`}>
        <span />
        <strong>{scene.model}</strong>
      </div>
      <iframe
        ref={frameRef}
        src={scene.src}
        loading="eager"
        title={`${scene.model}: ${scene.label}`}
        onLoad={connectKeyboard}
      />
      <div className="live-badge"><span />LIVE {scene.model} SCENE</div>
    </div>
  );
}

export default function App() {
  const revealRoot = useRef<HTMLDivElement>(null);
  const deck = useRef<RevealDeck | null>(null);
  const [slideNumber, setSlideNumber] = useState(1);
  const [liveMode, setLiveMode] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const currentDefinition = SLIDES[slideNumber - 1];
  const currentLive = currentDefinition?.live;

  useEffect(() => {
    if (!revealRoot.current) return;
    const instance = new Reveal(revealRoot.current, {
      width: 1280,
      height: 720,
      margin: 0,
      controls: false,
      progress: false,
      center: false,
      hash: true,
      hashOneBasedIndex: true,
      transition: "none",
      backgroundTransition: "none",
      preloadIframes: false,
      viewDistance: 3,
      plugins: [RevealNotes],
    }) as unknown as RevealDeck;
    deck.current = instance;

    const updateState = () => {
      setSlideNumber(instance.getIndices().h + 1);
      setLiveMode(false);
    };

    void instance.initialize().then(updateState);
    instance.on("slidechanged", updateState);

    const messageFromLab = (event: MessageEvent) => {
      if (event.data?.type === "deck:navigate") {
        if (event.data.direction > 0) instance.next();
        else instance.prev();
      }
      if (event.data?.type === "deck:close-live") setLiveMode(false);
    };
    window.addEventListener("message", messageFromLab);

    return () => {
      window.removeEventListener("message", messageFromLab);
      instance.off("slidechanged", updateState);
      instance.destroy();
      deck.current = null;
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, select, textarea")) return;
      if (event.key.toLowerCase() === "l" && currentLive) {
        event.preventDefault();
        setLiveMode((value) => !value);
      } else if (event.key === "Escape" && overviewOpen) {
        event.preventDefault();
        setOverviewOpen(false);
      } else if (event.key === "Escape" && liveMode) {
        event.preventDefault();
        setLiveMode(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentLive, liveMode, overviewOpen]);

  useEffect(() => {
    if (!overviewOpen) return;
    requestAnimationFrame(() => {
      document.querySelector(".slide-navigator-grid .is-current")?.scrollIntoView({ block: "center" });
    });
  }, [overviewOpen]);

  const currentFrame = () => deck.current?.getCurrentSlide()?.querySelector("iframe") as HTMLIFrameElement | null;
  const toggleLive = () => currentLive && setLiveMode((value) => !value);
  const resetLab = () => currentFrame()?.contentWindow?.location.reload();
  const openLab = () => {
    if (currentLive) window.open(new URL(currentLive.src, window.location.href), "_blank", "noopener,noreferrer");
  };
  const toggleOverview = () => {
    setLiveMode(false);
    setOverviewOpen((value) => !value);
  };
  const selectSlide = (index: number) => {
    deck.current?.slide(index);
    setOverviewOpen(false);
  };
  const enterFullscreen = () => document.documentElement.requestFullscreen?.();

  return (
    <main className={`deck-app${liveMode ? " is-live" : ""}`}>
      <div className="reveal" ref={revealRoot}>
        <div className="slides">
          {SLIDES.map((slide, index) => {
            const number = index + 1;
            const activeLive = liveMode && slideNumber === number && Boolean(slide.live);
            return (
              <section
                className="source-slide"
                data-live={slide.live ? "true" : undefined}
                data-section={slide.section}
                key={`${number}-${slide.title}`}
                aria-label={`${number}. ${slide.title}`}
              >
          {hasNativeMathSlide(number) ? (
            <NativeMathSlide number={number} />
          ) : hasNativeStaticSlide(number) ? (
            <NativeStaticSlide number={number} />
          ) : (
            <img
              className="source-slide-image"
              src={slideImage(index)}
              alt={`${slide.section}: ${slide.title}`}
              draggable={false}
            />
          )}
                {activeLive && slide.live ? <LiveLab scene={slide.live} /> : null}
                <Notes>{slideNotes[index]}</Notes>
              </section>
            );
          })}
        </div>
      </div>

      {overviewOpen ? (
        <div className="slide-navigator" role="dialog" aria-modal="true" aria-label="Slide navigator">
          <header>
            <div><span>SLIDE NAVIGATOR</span><strong>{SLIDES.length} slides</strong></div>
            <button onClick={() => setOverviewOpen(false)} aria-label="Close slide navigator" title="Close slide navigator"><X /></button>
          </header>
          <div className="slide-navigator-grid">
            {SLIDES.map((slide, index) => (
              <button
                className={slideNumber === index + 1 ? "is-current" : ""}
                key={`nav-${index + 1}`}
                onClick={() => selectSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              >
                <img src={slideImage(index)} alt="" draggable={false} />
                <span><b>{String(index + 1).padStart(2, "0")}</b>{slide.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <nav className="deck-controls" aria-label="Presentation controls">
        <button onClick={() => deck.current?.prev()} onPointerUp={(event) => event.currentTarget.blur()} title="Previous slide" aria-label="Previous slide"><ArrowLeft /></button>
        <button onClick={toggleOverview} onPointerUp={(event) => event.currentTarget.blur()} title="Slide navigator" aria-label="Slide navigator" aria-pressed={overviewOpen}><Rows3 /></button>
        <span className="control-page">{String(slideNumber).padStart(2, "0")}/{SLIDES.length}</span>
        <span className="control-divider" />
        <button
          className={currentLive ? "live-control is-available" : "live-control"}
          onClick={toggleLive}
          onPointerUp={(event) => event.currentTarget.blur()}
          disabled={!currentLive}
          title={liveMode ? "Return to original slide (L)" : currentLive?.label ?? "No live scene on this slide"}
          aria-label={liveMode ? "Return to original slide" : "Open live scene"}
          aria-pressed={liveMode}
        >
          {liveMode ? <ImageIcon /> : <MonitorPlay />}
        </button>
        <button onClick={resetLab} onPointerUp={(event) => event.currentTarget.blur()} disabled={!liveMode} title="Reset live scene" aria-label="Reset live scene"><RefreshCw /></button>
        <button onClick={openLab} onPointerUp={(event) => event.currentTarget.blur()} disabled={!currentLive} title="Open live scene separately" aria-label="Open live scene separately"><ExternalLink /></button>
        <span className="control-divider" />
        <button onClick={enterFullscreen} onPointerUp={(event) => event.currentTarget.blur()} title="Enter fullscreen" aria-label="Enter fullscreen"><Maximize /></button>
        <button onClick={() => deck.current?.next()} onPointerUp={(event) => event.currentTarget.blur()} title="Next slide" aria-label="Next slide"><ArrowRight /></button>
      </nav>
    </main>
  );
}
