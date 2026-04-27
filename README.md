# Sowmya's Personal Landing Page

My personal portfolio site for TCSS 506 — Practical Full Stack Development.
A small landing page with a bio, a gallery of animal photographs, and (as of v0.1.0) a click-to-zoom lightbox.

## What's here

```
├── index.html          ← Landing page
├── style.css           ← Page styling
├── css/
│   └── lightbox.css    ← Lightbox overlay styles (Week 3)
├── js/
│   └── lightbox.js     ← Lightbox behaviour (Week 3)
├── images/             ← My photos (+ a few starter samples)
├── package.json        ← Local dev-server script (`npm run serve`)
└── .gitignore
```

## Run locally

```bash
npm install
npm run serve
```

Then open http://localhost:8080. Click any thumbnail — the lightbox opens. Click the backdrop or press Escape to close.

## Releases

- **v0.1.0** — Lightbox gallery integrated into the landing page (Week 3).

## Deployment

Hosted as a static site on AWS S3. Upload `index.html`, `style.css`, the `css/`, `js/`, and `images/` folders to the bucket. Do **not** upload `.git`, `node_modules/`, `package*.json`, or `README.md` — those belong in the repo, not in production.

## Image tips

Resize photos to under 500 KB before uploading:

- **Mac:** `sips --resampleWidth 1000 photo.jpg`
- **Linux/WSL:** `convert photo.jpg -resize 1000x photo_resized.jpg`

Keep filenames lowercase with no spaces.

---

*TCSS 506 · Practical Full Stack Development*
