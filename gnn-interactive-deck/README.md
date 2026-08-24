# GNN Interactive Visual Lecture

A web-native, 62-slide English lecture on GCN, GraphSAGE, and GAT. The deck preserves the complete integrated presentation and speaker notes while adding live, same-origin Visual Lab scenes to selected principle and algorithm slides.

All 62 slide bodies are rendered natively with HTML, CSS, SVG, and KaTeX rather than baked into images. The original PNG exports remain only as navigator thumbnails and fallback assets. The three Visual Labs use the same notation and offline font assets, so text, diagrams, charts, and equations remain sharp, selectable, and accessible in both the slide and interactive views.

## Mathematical notation

- Scalars use italic lowercase symbols.
- Vectors use bold lowercase symbols.
- Matrices use bold uppercase symbols.
- Neighborhood and sampled sets use calligraphic symbols.
- Layer indices use parenthesized superscripts.
- Transpose uses an upright sans-serif `T`; concatenation uses a double vertical bar.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:4180/`.

The development command rebuilds all three Visual Labs and synchronizes the 62 integrated slide renders. The deck, slides, and labs are served from one origin.

## Presentation controls

- Arrow buttons or arrow keys: previous or next slide
- Grid button: open the 62-slide navigator
- Monitor button or `L`: enter Live Mode on an enhanced slide
- Image button or `Esc`: return to the original slide
- Reset button: restore the current live scene
- External-link button: open the current scene independently
- Fullscreen button: enter browser fullscreen
- `S`: open Reveal.js speaker view with the original notes

## Production build

```bash
npm run build
npm run preview
```

The `dist` directory contains the complete deck, all slide renders, and all three Visual Labs. It requires only a static web server and no internet connection.
