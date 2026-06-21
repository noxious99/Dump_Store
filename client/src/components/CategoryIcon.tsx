import type { CSSProperties } from "react";

// Gradient duotone icons for expense categories & income sources.
// Source SVGs live in src/assets/category-icons/{16,20}/ and are produced by
// scripts/generate-category-icons.mjs. We pull them in via Vite's glob import so
// there is a single source of truth (the generated files) and no duplicated path
// data. Small SVGs are inlined as data URIs by Vite, so this costs no extra requests.
//
// RN portability: this <img> layer is the only part that needs rewriting for the
// future React Native app (→ Image / react-native-svg). The icon set itself transfers.

const files = import.meta.glob("../assets/category-icons/*/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const urlBySizeName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/category-icons\/(\d+)\/([\w-]+)\.svg$/);
  if (match) urlBySizeName[`${match[1]}/${match[2]}`] = url;
}

export type CategoryIconName =
  | "travel"
  | "food"
  | "rent"
  | "utility"
  | "groceries"
  | "entertainment"
  | "subscriptions"
  | "clothing"
  | "health"
  | "miscellaneous"
  | "salary"
  | "freelance"
  | "investment"
  | "rental"
  | "gift"
  | "bonus"
  | "refund"
  | "interest"
  // Feature / domain icons (dashboard tabs + activity feed)
  | "expense"
  | "goal"
  | "iou";

export type CategoryIconSize = 16 | 20;

interface CategoryIconProps {
  /** Category name or income source value (case-insensitive). */
  name?: string | null;
  /** Pixel size — matches the two generated variants. Defaults to 20. */
  size?: CategoryIconSize;
  /** Icon to fall back to when `name` has no matching icon. */
  fallback?: CategoryIconName;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders the gradient duotone icon for a category / income source.
 * Use `fallback="salary"` for income sources, default `miscellaneous` for expenses.
 */
export function CategoryIcon({
  name,
  size = 20,
  fallback = "miscellaneous",
  className,
  style,
}: CategoryIconProps) {
  const key = (name ?? "").toLowerCase();
  const url = urlBySizeName[`${size}/${key}`] ?? urlBySizeName[`${size}/${fallback}`];

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
      style={style}
    />
  );
}

export default CategoryIcon;
