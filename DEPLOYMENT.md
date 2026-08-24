# Deployment

## Recommended production setup: Cloudflare Pages

Connect this repository to Cloudflare Pages with the following settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | repository root |
| Build command | `npm run ci:build` |
| Build output directory | `gnn-interactive-deck/dist` |
| Node.js version | `22` |

No environment variables are required. Every push to `main` publishes production, while other branches receive preview URLs.

The site uses relative asset paths, so it works on both a root domain and a repository subpath. The `_headers` file gives the service worker a no-cache policy while allowing versioned application assets to be cached for a year.

## GitHub Pages fallback

The repository includes `.github/workflows/deploy-pages.yml`. To enable it:

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. Run the **Deploy GitHub Pages fallback** workflow or push to `main`.

The resulting fallback URL follows this format:

```text
https://<account>.github.io/<repository>/
```

## PWA and offline behavior

The production build generates a versioned service worker after Vite finishes. It precaches the integrated deck, KaTeX fonts, slide thumbnails, and all Visual Lab assets. A new deployment creates a new cache and removes previous versions.

For the most reliable classroom workflow:

1. Open the production URL while online.
2. Wait for the first page to finish loading.
3. Use the browser's **Install app** command.
4. Open the installed app once before travelling to the venue.

## Downloadable offline archive

Run `npm run package:offline`. After extracting the archive, use the included launcher:

- Windows: `start-windows.bat`
- macOS/Linux: `./start-local.sh`

The launchers require Python 3 and serve the files at `http://localhost:4180/`. Opening `index.html` directly is not supported because browser security rules restrict JavaScript modules and service workers on `file://` URLs.
