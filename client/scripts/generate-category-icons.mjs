// Generates duotone line-style SVG icons for every expense category & income source.
//
// Art style: outline / "borderline" icons drawn with a primary→secondary gradient
// (#6366F1 → #14B8A6). A meaningful sub-region of each glyph is FILLED with the same
// gradient (at reduced opacity) so the icon doesn't read as hollow — e.g. the lower
// half of the pill, the TV screen, the house body, the cart basket.
// Two size variants are emitted per icon: 16px and 20px.
//
// Run:  node client/scripts/generate-category-icons.mjs
// Output: client/src/assets/category-icons/{16,20}/<name>.svg
//
// All paths are authored on a 24×24 grid (Lucide-compatible geometry) so the same
// path table can later be lifted into a react-native-svg component for the RN app.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = resolve(__dirname, "../src/assets/category-icons");

// Icons use the app's signature brand gradient: a left→right blend from primary
// (indigo) to accent (violet) — the same `from-primary to-accent` flow used by the
// navbar, .text-gradient, .section-gradient and the dashboard CTA. Teal/secondary
// is deliberately not used here: it never appears as a solo 2-stop gradient in the
// app (only in large 3-color decorative sweeps), so it would be off-system.
//
// Dark theme is the app's primary surface, so the icons are tuned for it: these are
// the lighter brand variants from index.css's `.dark` block (--primary / --accent),
// which read bright and on-brand against the dark cards. (The light-500 variants
// #6366F1/#7C3AED looked muddy on dark.)
const PRIMARY = "#818CF8"; // indigo-400 (dark-theme --primary)
const ACCENT = "#A78BFA"; // violet-400 (dark-theme --accent)

// Primary-weighted: the gradient vector runs past the icon's right edge (x:2→22),
// so each icon only spans indigo → ~2/3 toward violet, never the full violet. This
// keeps the set primary-dominant — matching the app's indigo-led palette (primary
// is used ~5x more than accent) — while the violet tail carries the brand richness.
// It also tightens icon-to-icon uniformity (shorter total colour travel) and stays
// perfectly smooth (pure 2-stop, no mid-stop kink).
const GRAD_X2 = 32;

// Default opacity of the gradient fill behind the linework. Raise for a more solid
// look, lower for a lighter tint. Per-icon exceptions go in FILL_OVERRIDES below.
const FILL_OPACITY = 0.8;

// Per-icon fill opacity overrides (interior detail reads better lighter on some glyphs).
const FILL_OVERRIDES = {
  bonus: 0.25,
  rent: 0.25,
  rental: 0.25,
  salary: 0.25,
  travel: 0.25,
  subscriptions: 0.4,
  gift: 0.25,
  expense: 0.4,
};

// Per-size stroke widths (in 24-grid units). Smaller icons get a heavier stroke
// so the line weight stays optically consistent and never disappears.
const SIZES = {
  16: 1.9,
  20: 1.6,
};

// Shared glyphs. `home` is reused for `rent` + `rental`.
const HOME = {
  fill: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  stroke: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>`,
};
const SHUFFLE = {
  fill: `<path d="M18 2l4 4-4 4z"/><path d="M18 14l4 4-4 4z"/>`,
  stroke: `<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>`,
};

const ICONS = {
  // --- Expense categories ---
  travel: {
    fill: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>`,
    stroke: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`,
  },
  food: {
    fill: `<path d="M3.5 11a8.5 5 0 0 1 17 0z"/><path d="M3.5 17.5h17a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5z"/>`,
    stroke: `<path d="M3.5 11a8.5 5 0 0 1 17 0z"/><path d="M4 14.5h16"/><path d="M3.5 17.5h17a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5z"/>`,
  },
  rent: HOME,
  utility: {
    fill: `<path d="M6 8a6 6 0 0 1 12 0c0 1.3-.5 2.6-1.5 3.5-.8.8-1.3 1.5-1.5 2.5H9c-.2-1-.7-1.7-1.5-2.5C6.5 10.6 6 9.3 6 8z"/>`,
    stroke: `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`,
  },
  groceries: {
    fill: `<path d="M5.12 7H22l-1.65 7.43a2 2 0 0 1-1.95 1.57H8.71a2 2 0 0 1-2-1.58z"/>`,
    stroke: `<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>`,
  },
  entertainment: {
    fill: `<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
    stroke: `<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
  },
  subscriptions: {
    fill: `<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>`,
    stroke: `<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><path d="m17 2-5 5-5-5"/>`,
  },
  clothing: {
    fill: `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>`,
    stroke: `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>`,
  },
  health: {
    // Lower-right half of the capsule filled (the classic two-tone pill).
    fill: `<path d="M8.5 8.5 15.5 15.5 10.5 20.5a4.95 4.95 0 0 1-7-7z"/>`,
    stroke: `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>`,
  },
  miscellaneous: SHUFFLE,

  // --- Income sources (unique ones) ---
  salary: {
    fill: `<rect width="20" height="14" x="2" y="6" rx="2"/>`,
    stroke: `<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>`,
  },
  freelance: {
    fill: `<path d="M5 16V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9z"/>`,
    stroke: `<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>`,
  },
  investment: {
    fill: `<path d="M16 7h6v6z"/>`,
    stroke: `<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>`,
  },
  rental: HOME,
  gift: {
    fill: `<path d="M5 12h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>`,
    stroke: `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>`,
  },
  bonus: {
    fill: `<path d="M14.5 7c2.6 1.5 4 4.4 4 7.5 0 3.6-2.9 6.5-6.5 6.5S5.5 18.1 5.5 14.5c0-3.1 1.4-6 4-7.5z"/>`,
    stroke: `<path d="M9.5 7h5l1.6-2.9a.6.6 0 0 0-.5-.9H8.4a.6.6 0 0 0-.5.9z"/><path d="M14.5 7c2.6 1.5 4 4.4 4 7.5 0 3.6-2.9 6.5-6.5 6.5S5.5 18.1 5.5 14.5c0-3.1 1.4-6 4-7.5"/><path d="M13.6 12c-.4-.6-1-.9-1.6-.9-1 0-1.8.6-1.8 1.4s.8 1.1 1.8 1.4 1.8.6 1.8 1.4-.8 1.4-1.8 1.4c-.7 0-1.3-.3-1.7-.9"/><path d="M12 10v1M12 16v1"/>`,
  },
  refund: {
    fill: `<path d="M9 14 4 9l5-5z"/>`,
    stroke: `<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>`,
  },
  interest: {
    fill: `<path d="M12 2 20.5 7h-17z"/>`,
    stroke: `<path d="M3 22h18"/><path d="M6 18V11"/><path d="M10 18V11"/><path d="M14 18V11"/><path d="M18 18V11"/><path d="M12 2 20.5 7h-17z"/>`,
  },

  // --- Feature / domain icons (dashboard tabs + activity feed) ---
  expense: {
    fill: `<rect x="2" y="5" width="20" height="14" rx="2"/>`,
    stroke: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 14.5h4"/>`,
  },
  goal: {
    fill: `<circle cx="12" cy="12" r="2.5"/>`,
    stroke: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2.5"/>`,
  },
  iou: {
    // Handshake — the most recognizable "IOU / agreement between people" read.
    // Line-only (no fill): a handshake doesn't fill into anything legible, so this
    // is the one intentional stroke-only glyph in the set.
    stroke: `<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>`,
  },
};

function svg({ fill, stroke }, size, gradId, name) {
  const sw = SIZES[size];
  const fillOpacity = FILL_OVERRIDES[name] ?? FILL_OPACITY;
  const fillLayer = fill
    ? `\n    <g fill="url(#${gradId})" fill-opacity="${fillOpacity}" stroke="none">${fill}</g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
  <defs>
    <linearGradient id="${gradId}" x1="2" y1="12" x2="${GRAD_X2}" y2="12" gradientUnits="userSpaceOnUse">
      <stop stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${ACCENT}"/>
    </linearGradient>
  </defs>${fillLayer}
  <g fill="none" stroke="url(#${gradId})" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${stroke}</g>
</svg>
`;
}

let count = 0;
for (const size of Object.keys(SIZES)) {
  const dir = resolve(OUT_ROOT, size);
  mkdirSync(dir, { recursive: true });
  for (const [name, icon] of Object.entries(ICONS)) {
    // Unique gradient id per file so inlining many icons never collides.
    const gradId = `grad-${name}-${size}`;
    writeFileSync(resolve(dir, `${name}.svg`), svg(icon, Number(size), gradId, name), "utf8");
    count++;
  }
}

console.log(`Generated ${count} SVG icons (${Object.keys(ICONS).length} icons × ${Object.keys(SIZES).length} sizes) in ${OUT_ROOT}`);
