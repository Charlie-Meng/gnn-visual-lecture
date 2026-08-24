import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Network,
  Orbit,
  Scale,
  Shuffle,
  Workflow,
} from "lucide-react";
import { scenes } from "./scenes";

const icons = [GitBranch, Orbit, Shuffle, Workflow, Boxes, Scale, Network];

export default function App() {
  const params = useMemo(() => new URLSearchParams(
    (window as Window & { __VISUAL_LAB_PARAMS__?: string }).__VISUAL_LAB_PARAMS__ ?? window.location.search,
  ), []);
  const initial = Math.max(0, scenes.findIndex((scene) => scene.id === params.get("scene")));
  const [sceneIndex, setSceneIndex] = useState(initial);
  const clean = params.get("clean") === "1";
  const scene = scenes[sceneIndex];
  const Scene = scene.component;

  useEffect(() => {
    const next = new URL(window.location.href);
    next.searchParams.set("scene", scene.id);
    window.history.replaceState({}, "", next);
  }, [scene.id]);

  const move = (direction: number) => {
    setSceneIndex((value) => Math.max(0, Math.min(scenes.length - 1, value + direction)));
  };

  return (
    <main className={`app-shell ${clean ? "is-clean" : ""}`}>
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true"><Network /></div>
        <div className="brand-copy">
          <b>GraphSAGE Visual Lab</b>
          <span>Inductive Representation Learning</span>
        </div>
        {!clean && (
          <nav className="scene-nav" aria-label="Visualization chapters">
            {scenes.map((item, index) => {
              const Icon = icons[index];
              return (
                <button key={item.id} className={sceneIndex === index ? "active" : ""} onClick={() => setSceneIndex(index)} title={item.title} aria-label={item.title}>
                  <Icon />
                  <span>{index + 1}</span>
                </button>
              );
            })}
          </nav>
        )}
        <div className="chapter-count">{String(sceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</div>
      </header>

      <section className="scene-heading">
        <span>{scene.kicker}</span>
        <h1>{scene.title}</h1>
      </section>

      <Scene />

      {!clean && (
        <footer className="scene-footer">
          <button className="icon-button" onClick={() => move(-1)} disabled={sceneIndex === 0} title="Previous chapter" aria-label="Previous chapter"><ChevronLeft /></button>
          <div className="progress-track"><span style={{ width: `${((sceneIndex + 1) / scenes.length) * 100}%` }} /></div>
          <button className="icon-button" onClick={() => move(1)} disabled={sceneIndex === scenes.length - 1} title="Next chapter" aria-label="Next chapter"><ChevronRight /></button>
        </footer>
      )}
    </main>
  );
}
