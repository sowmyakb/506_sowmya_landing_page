# INTEGRATION-NOTES.md

**TCSS 506 · Week 3 · Task 3 — Integrate the Lightbox Into Your Landing Page**

This file documents the four integration decisions the assignment asks about, plus the small set of enhancements I added on top of the starter.

---

## 1. Where the lightbox triggers live

The triggers are the six `<figure class="photo">` cards inside the existing `<section class="gallery">` (`index.html` lines 41–91). Every photo card is itself the click target — clicking anywhere on a card (image, caption overlay, padding) opens the lightbox at that card's index.

**Why this placement.** The page already had a polished gallery section before this assignment. Carving out a separate "lightbox gallery" alongside it would have been redundant and would have split the photographic content into two near-identical groupings. Treating the existing gallery *as* the lightbox trigger surface integrates the feature into the page's structure rather than bolting a new section on the side. The `.intro` section's heading ("A few animal pictures.") and the about section's signoff sit unchanged; the only thing the user perceives differently is that thumbnails now zoom open into a full-screen view on click.

**Why the figure (not just the image) is clickable.** Each card has both an image and a layered caption (`caption-title` plus `caption-sub`). If only the `<img>` opened the lightbox, clicking the caption would do nothing — a small but real "dead zone" that breaks the affordance the hover-lift creates. Binding the click to the figure means the entire visible card is the hit target.

---

## 2. The content the lightbox shows

All six photos in `state.images` (`js/lightbox.js` lines 20–27) are my own — drawn from the same `images/` folder that powers the existing gallery, in the same order they appear on the page so the lightbox's index matches the gallery's reading order. The starter's three sample SVGs are still on disk but are no longer referenced anywhere in code; they will be deleted before final submission.

Each image carries the same two-part caption from the gallery, joined with an em-dash:

```
Family, in grey — a mother and her six-week-old, on a road that belongs to them
```

The two parts already existed in the markup as `caption-title` and `caption-sub`; the lightbox keeps both rather than collapsing to one because the title alone is too terse for a full-screen presentation, while the subtitle alone strips the framing the title provides. Rendering them together as one Fraunces italic line, separated by an em-dash, preserved the editorial voice the rest of the page is written in.

The subjects themselves represent the bio at the top of the page — wild animals, a rescue puppy, a horse in golden light, a fox painted in the 1800s. They are the visual half of the line "wild hearts, soft eyes" in the page title.

---

## 3. Class-name reconciliation

**Decision.** I changed the starter to match my markup, not the other way around. The starter's `lightbox.js` queried `.gallery__thumb` for thumbnails; I changed that one line to query `.photo`, the class my existing `<figure>` cards already carry. The lightbox-internal classes (`.lightbox`, `.lightbox__img`, `.lightbox__caption`) were kept exactly as the starter named them — those are private to the overlay, so there was no naming pressure from my page.

**The change, in `js/lightbox.js`:**

```js
// before (starter, line 9 at commit 6828587):
const thumbs   = document.querySelectorAll('.gallery__thumb');

// after:
const thumbs   = document.querySelectorAll('.photo');
```

**Why this direction.** Three reasons, in order of weight:

1. **Smallest surface area.** One line, one file. The alternative — sprinkling `gallery__thumb` onto every `<figure>` in `index.html` — would have touched every photo card and added a class that would do nothing visually unless the starter's `.gallery__thumb` CSS rules were also kept active.
2. **My CSS stays the source of truth for the gallery.** The starter's `.gallery__thumb` rule sets `aspect-ratio: 1 / 1`. My masonry grid uses a `.photo.tall` modifier (`style.css` lines 166–168) to make some figures span two grid rows. Adopting the starter's class would have forced every figure into a square and broken that layout.
3. **The starter's JS is generic; my markup is specific.** The starter's class names were chosen abstractly to fit any gallery; my page's class names mean something inside my design system. Bending generic toward specific costs less.

**What I did *not* keep.** The starter's `.gallery` rule and `.gallery__thumb` rule were both removed from `css/lightbox.css`. Those are gallery-layout concerns and they belonged to my `style.css`, which already had them.

---

## 4. CSS conflicts and resolutions

There were two real conflicts and one cosmetic decision.

### Conflict A — duplicated `.gallery` rule

`style.css` lines 149–154 and `lightbox.css` lines 7–14 (in the original starter) both defined rules for `.gallery`. They disagreed on every meaningful property:

| Property | `style.css` (mine) | `lightbox.css` (starter) |
|---|---|---|
| `grid-template-columns` | `repeat(3, 1fr)` | `repeat(auto-fill, minmax(160px, 1fr))` |
| `grid-auto-rows` | `260px` | (not set) |
| `gap` | `18px` | `1rem` |
| `padding` | (none) | `1rem` |
| `max-width` | (none, comes from `.page`) | `900px` |

If `lightbox.css` had loaded after `style.css`, the starter's auto-fill grid would have replaced my fixed three-column masonry — same selector, same specificity, source order would decide.

**Resolution.** I deleted the starter's `.gallery` rule from `lightbox.css` outright. The conflict is resolved at the source, not by relying on stylesheet load order or CSS specificity. My layout is the only definition that exists.

### Conflict B — implicit `.gallery__thumb` styling

The starter's `.gallery__thumb` rule (`lightbox.css` lines 16–24, in the original) set `aspect-ratio: 1 / 1`, `object-fit: cover`, `cursor: pointer`, `border: 1px solid #ddd`, and a hover-scale transform. Because I used Path B (edit the JS, not the markup) for class reconciliation, no element on my page now carries the `gallery__thumb` class — so this rule had no targets and was dead code.

**Resolution.** Deleted, alongside Conflict A's rule. I kept the *idea* of the cursor hint by adding a tiny `.photo { cursor: pointer; }` rule into `lightbox.css` — that lives in `lightbox.css` rather than `style.css` because the cursor hint exists *because of* the lightbox, not the gallery itself.

### Cosmetic decision — restyling the overlay to match the page

The starter's overlay was visually correct but generic: pure black backdrop, white sans-serif caption, no controls beyond an Escape key. That would have looked like a different feature dropped onto the page rather than a part of it. Rather than leave it as-is, I restyled the overlay rules to match the Golden Hour theme:

- **Backdrop:** `rgba(20, 14, 10, 0.93)` — a warm near-black that picks up the same tone the gallery's caption gradient already uses (`style.css` lines 199–203), instead of the starter's flat `rgba(0, 0, 0, 0.85)`.
- **Caption:** Fraunces italic in cream (`#f5efe6`, the `--cream` token from `style.css`), matching the typography of `.intro h2` and the about section. The starter's sans-serif white caption was replaced.
- **Counter (new):** Inter, 11px, letter-spacing 0.28em, terracotta — directly reusing the typographic recipe from `.eyebrow` (`style.css` lines 65–72) so it reads as a sibling of "personal site · 2026".
- **Controls (new):** Fraunces light glyphs (`×`, `❮`, `❯`) in cream-at-70%-opacity by default, transitioning to the terracotta accent (`--accent`) on hover. Matches the existing `nav a` underline-on-accent treatment.

These rules live in `css/lightbox.css` only — `style.css` is unchanged.

---

## 5. Enhancements beyond the starter

The starter delivered: open on thumbnail click, close on backdrop click, close on Escape. I kept all three and added:

- **Previous / Next image navigation.** New mutators `nextImage()` and `prevImage()` (lines 42–50 of `lightbox.js`) cycle through `state.images` modulo the array length, so it wraps cleanly at both ends. Fired by clicking the on-overlay arrows or pressing `ArrowLeft` / `ArrowRight`.
- **Image counter.** `render()` now writes `${state.index + 1} / ${state.images.length}` into a third overlay element, `lightbox__counter`, so the user knows their position in the set.
- **Close button.** A dedicated `×` button at the top-right of the overlay, in addition to backdrop click and Escape — the three common patterns for closing modals.
- **`aria-modal`, `aria-hidden`, `aria-label`s.** The overlay is announced as a dialog to screen readers, hidden when not open, and each control has a descriptive label.
- **`:focus-visible` outlines.** Keyboard users see a terracotta focus ring on the controls.

The render pattern was preserved — all three new mutators end with a single `render()` call, and `render()` is still the only place the DOM is mutated. The state-and-render discipline the starter teaches is what made adding all five of these things a low-risk operation.
