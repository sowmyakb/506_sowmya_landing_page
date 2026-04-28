// CS 506 · Week 3 · Lightbox — integrated into Sowmya's landing page.
// Builds on the starter's state+render pattern; adds prev/next navigation,
// keyboard controls, and an image counter. Queries .photo so the existing
// gallery markup in index.html stays untouched (Path B reconciliation).

// ── DOM refs (cached once at load time) ─────────────────────────────────
const lb       = document.querySelector('.lightbox');
const lbImg    = lb.querySelector('.lightbox__img');
const lbCap    = lb.querySelector('.lightbox__caption');
const lbCount  = lb.querySelector('.lightbox__counter');
const lbClose  = lb.querySelector('.lightbox__close');
const lbPrev   = lb.querySelector('.lightbox__prev');
const lbNext   = lb.querySelector('.lightbox__next');
const thumbs   = document.querySelectorAll('.photo');

// ── State ───────────────────────────────────────────────────────────────
const state = {
  isOpen: false,
  index: 0,
  images: [
    { src: 'images/wolf-gaze.jpg',     title: 'The whole pack, quietly',      sub: 'two arctic wolves and a pup who doesn\u2019t know he\u2019s mighty yet' },
    { src: 'images/elephant-calf.jpg', title: 'Family, in grey',              sub: 'a mother and her six-week-old, on a road that belongs to them' },
    { src: 'images/rescue-dog.jpg',    title: 'Hope has four paws',           sub: 'a street puppy, braver than all of us' },
    { src: 'images/fox-snow.jpg',      title: 'Small fire in the snow',       sub: 'foxes painted in the 1800s \u2014 still alive to me' },
    { src: 'images/horse-freedom.jpg', title: 'Unfenced',                     sub: 'a white horse in golden light' },
    { src: 'images/puppy-hope.jpg',    title: 'Exhibit A: easily distracted', sub: 'a puppy, a pink flower, a full heart' },
  ],
};

// ── Mutators ────────────────────────────────────────────────────────────
function openLightbox(i) {
  state.isOpen = true;
  state.index = i;
  render();
}

function closeLightbox() {
  state.isOpen = false;
  render();
}

function nextImage() {
  state.index = (state.index + 1) % state.images.length;
  render();
}

function prevImage() {
  state.index = (state.index - 1 + state.images.length) % state.images.length;
  render();
}

// ── Render (state → DOM) ────────────────────────────────────────────────
function render() {
  if (state.isOpen) {
    const { src, title, sub } = state.images[state.index];
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', title);
    lbCap.textContent = sub ? `${title} \u2014 ${sub}` : title;
    lbCount.textContent = `${state.index + 1} / ${state.images.length}`;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
  } else {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
  }
}

// ── Event listeners ─────────────────────────────────────────────────────
thumbs.forEach((thumb, i) => {
  thumb.addEventListener('click', () => openLightbox(i));
});

lb.addEventListener('click', (e) => {
  if (e.target === lb) closeLightbox();
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevImage);
lbNext.addEventListener('click', nextImage);

document.addEventListener('keydown', (e) => {
  if (!state.isOpen) return;
  if (e.key === 'Escape')          closeLightbox();
  else if (e.key === 'ArrowRight') nextImage();
  else if (e.key === 'ArrowLeft')  prevImage();
});
