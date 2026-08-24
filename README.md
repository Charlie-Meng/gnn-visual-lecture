# GNN Visual Lecture

An interactive, English-language visual lecture on Graph Neural Networks. The 62-slide deck combines native HTML, SVG, CSS, and KaTeX slides with three embedded visual laboratories:

- Graph Convolutional Networks (GCN)
- GraphSAGE
- Graph Attention Networks (GAT)

The presentation is designed for browser-based teaching, projector use, and offline installation as a Progressive Web App.

## Local development

Install and build every application from a clean checkout:

```bash
npm run ci:build
npm run preview
```

The presentation is then available at `http://localhost:4180/`.

## Project structure

- `gnn-interactive-deck/`: integrated Reveal.js presentation
- `gcn-visual-lab/`: GCN interactive laboratory
- `graphsage-visual-lab/`: GraphSAGE interactive laboratory
- `gat-visual-lab/`: GAT interactive laboratory

## Deployment

The production build is emitted to `gnn-interactive-deck/dist`. It can be hosted on Cloudflare Pages, GitHub Pages, Vercel, Netlify, or any static web server. See [DEPLOYMENT.md](DEPLOYMENT.md) for the Cloudflare Pages and GitHub Pages setup.

## Offline use

The production site is an installable PWA. Once loaded, the complete deck, fonts, slide thumbnails, and all three visual labs are cached for offline presentation.

To create a downloadable archive:

```bash
npm run package:offline
```

The archive is written to `offline-release/gnn-visual-lecture.zip`.

## Source material

Research papers, legacy PowerPoint files, and local authoring output are intentionally excluded from the public application repository. This keeps the deployable project focused and avoids redistributing source material that may have separate licensing terms.
