# gn — portfolio

Personal portfolio of Guilherme Nóbrega. Vite + React + TypeScript, Tailwind CSS and shadcn/ui.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Structure

```
src/
  App.tsx                     page layout (section order lives here)
  main.tsx                    React entry
  index.css                   Tailwind + shadcn tokens mapped to the site palette
  styles/portfolio.css        all site styles (colour tokens at the top: light + dark)
  components/
    layout/                   Nav, Footer, Toast, cursor/progress overlays
    sections/                 Hero, Morph (particles), About, Experience,
                              Certificates, Work, Stack, Playground, Contact
    ui/button.tsx             shadcn/ui Button
  engine/engine.ts            canvases, scroll effects, terminal, games, easter eggs
  data/landDots.ts            land points for the dotted globe
  assets/                     photo and certificate images
```

React renders the markup. `engine.ts` starts once after the first render (see `App.tsx`)
and wires up the animations by element id, so keep ids and class names when editing sections.

## Colours

Edit the tokens at the top of `src/styles/portfolio.css`:
`--accent` is the pink (`#f7a8a9` dark, `#ea7479` light).

## shadcn/ui

`components.json` is set up. Add components with:

```bash
npx shadcn@latest add dialog
```

They pick up the site palette through the tokens in `src/index.css`.

## Deploy (GitHub Pages)

Move `deploy-github-pages.yml` to `.github/workflows/deploy.yml`. It then builds and publishes on every push to `main`:

```bash
mkdir -p .github/workflows && mv deploy-github-pages.yml .github/workflows/deploy.yml
```

In the repository go to Settings → Pages and set Source to "GitHub Actions".
`vite.config.ts` uses `base: "./"`, so it works under `/portfolio/`.
