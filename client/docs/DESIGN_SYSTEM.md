# Tracero Design System

A comprehensive guide for maintaining visual consistency across the Tracero application.

---

## Table of Contents

1. [Overview](#overview)
2. [Typography](#typography)
3. [Color System](#color-system)
4. [Gradients & Color Flow](#gradients--color-flow)
5. [Spacing & Sizing](#spacing--sizing)
6. [Components](#components)
7. [Page Layouts](#page-layouts)
8. [Forms](#forms)
9. [Animations](#animations)
10. [Dark Mode](#dark-mode)
11. [Quick Reference](#quick-reference)

---

## Overview

Tracero's design system is built on:
- **Tailwind CSS v4** with CSS custom properties
- **shadcn/ui** component library
- **Slate color palette** as the neutral foundation
- **Three brand colors**: Primary (Indigo), Secondary (Teal), Accent (Violet)

### Design Philosophy
- Clean, modern aesthetic with subtle gradients
- Playful use of color while maintaining professionalism
- Clear visual hierarchy through color and spacing
- Consistent patterns across all pages

---

## Typography

### Font Stack

| Purpose | Font Family | Usage |
|---------|-------------|-------|
| **Body** | `Inter` | All body text, paragraphs, labels |
| **Headings** | `Manrope` | h1-h6, titles, card headers |
| **Decorative** | `Kalam` | Handwritten style (sparingly) |

### CSS Variables
```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-heading: "Manrope", "Inter", sans-serif;
--font-handwriting: "Kalam", cursive;
```

### Usage
```jsx
// Headings automatically use Manrope
<h1 className="text-4xl font-bold">Heading</h1>

// Body text uses Inter by default
<p className="text-base">Body text</p>
```

---

## Color System

### Brand Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Primary** | `#6366F1` | `indigo-500` | Main actions, links, primary buttons |
| **Primary Lite** | `#EEF2FF` | `indigo-50` | Light backgrounds, hover states |
| **Secondary** | `#14B8A6` | `teal-500` | Supporting elements, success accents |
| **Secondary Lite** | `#CCFBF1` | `teal-100` | Light teal backgrounds |
| **Accent** | `#7C3AED` | `violet-600` | Highlights, CTAs, hover states |

### Neutral Colors (Slate Palette)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Foreground** | `#0F172A` | `slate-900` | Primary text |
| **Muted Foreground** | `#64748B` | `slate-500` | Secondary text, placeholders |
| **Grey** | `#1E293B` | `slate-800` | Dark sections (footer) |
| **Grey-x100** | `#F1F5F9` | `slate-100` | Section backgrounds |
| **Grey-x200** | `#E2E8F0` | `slate-200` | Borders, dividers |
| **Grey-x300** | `#CBD5E1` | `slate-300` | Subtle borders |
| **Muted** | `#F8FAFC` | `slate-50` | Input backgrounds, cards |
| **Background** | `#FFFFFF` | `white` | Page background |

### Semantic Colors

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Success** | `#10B981` | `emerald-500` | Goal tracker, positive states |
| **Success Lite** | `#D1FAE5` | `emerald-100` | Success backgrounds |
| **Error** | `#EF4444` | `red-500` | Errors, IOU tracker accent |
| **Error Lite** | `#FEE2E2` | `red-100` | Error backgrounds |
| **Warning** | `#F59E0B` | `amber-500` | Warnings, alerts |
| **Info** | `#0EA5E9` | `sky-500` | Information, tips |

### Chart Colors
```css
--chart-1: #F97316;  /* orange-500 */
--chart-2: #06B6D4;  /* cyan-500 */
--chart-3: #8B5CF6;  /* violet-500 */
--chart-4: #10B981;  /* emerald-500 */
--chart-5: #EC4899;  /* pink-500 */
```

---

## Gradients & Color Flow

### Page-Specific Gradients

| Component | Gradient | Direction | Purpose |
|-----------|----------|-----------|---------|
| **Navbar** | `from-primary to-accent` | `→` (right) | Brand identity bar |
| **Signin Left Panel** | `from-primary via-accent to-secondary` | `↘` (br) | Welcome visual |
| **Signup Left Panel** | `from-secondary via-primary to-accent` | `↘` (br) | Reversed for variety |
| **CTA Section** | `from-primary to-accent` | `→` (right) | Call-to-action block |
| **Footer** | `bg-grey` | Solid | Dark anchor |

### Gradient Classes
```jsx
// Navbar
className="bg-gradient-to-r from-primary to-accent"

// Auth pages (decorative panel)
className="bg-gradient-to-br from-primary via-accent to-secondary"

// Hero section subtle gradient
className="bg-gradient-to-br from-primary/5 via-background to-secondary/5"

// Benefits section
className="bg-gradient-to-br from-primary/5 via-grey-x100 to-secondary/5"
```

### Decorative Blobs
Use for depth and visual interest on gradient sections:
```jsx
<div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
<div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
```

---

## Spacing & Sizing

### Border Radius Scale
```css
--radius: 0.625rem;        /* 10px - base */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;         /* default */
--radius-xl: 14px;
--radius-2xl: 18px;
--radius-3xl: 26px;
```

### Common Patterns
```jsx
// Buttons
className="rounded-lg"     // Standard
className="rounded-xl"     // Larger buttons

// Cards
className="rounded-xl"     // Standard cards
className="rounded-2xl"    // Feature cards
className="rounded-3xl"    // Hero elements

// Inputs
className="rounded-lg"     // All form inputs
```

### Section Padding
```jsx
// Standard sections
className="py-20 lg:py-28 px-6"

// Hero sections
className="py-16 lg:py-24 px-6 lg:px-12"

// CTA sections
className="py-16 lg:py-20 px-6"
```

---

## Components

### Buttons

#### Primary Button
```jsx
<Button className="bg-primary hover:bg-accent rounded-lg shadow-md transition-all duration-200">
  Action
</Button>
```

#### Secondary/Outline Button
```jsx
<Button variant="outline" className="border-2 border-border hover:bg-muted rounded-lg">
  Secondary
</Button>
```

#### Ghost Button (Navbar)
```jsx
<Button variant="ghost" className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10">
  Link
</Button>
```

### Cards

#### Standard Card
```jsx
<Card className="bg-card rounded-xl shadow-lg border border-border/50">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### Responsive Card (Auth pages)
```jsx
<Card className="border-0 shadow-none xl:shadow-xl xl:border xl:border-border">
```

#### Feature Card Accents
```jsx
// Goal Tracker
className="from-success/5 to-card hover:from-success/10"

// Expense Tracker
className="from-primary/5 to-card hover:from-primary/10"

// IOU Tracker
className="from-error/5 to-card hover:from-error/10"
```

### Inputs

#### Standard Input
```jsx
<Input className="h-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg" />
```

#### Input with Icon
```jsx
<FormLabel className="text-foreground font-medium flex items-center gap-2">
  <MdOutlineEmail className="text-muted-foreground" />
  Email
</FormLabel>
```

### Error Messages
```jsx
// Inline error
<FormMessage className="text-error text-sm" />

// Error banner
<div className="w-full p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium text-center">
  {errorMessage}
</div>
```

---

## Page Layouts

### Homepage Sections

| Section | Background | Notes |
|---------|------------|-------|
| Hero | `from-primary/5 via-background to-secondary/5` | With decorative blobs |
| Features | `bg-grey-x100` | Slate-100 solid |
| How It Works | `bg-background` | White |
| Benefits | `from-primary/5 via-grey-x100 to-secondary/5` | With decorative blobs |
| CTA | `from-primary to-accent` | Full gradient |
| Footer | `bg-grey` | Slate-800 dark |

### Auth Pages Layout
```jsx
<div className="min-h-screen flex">
  {/* Left: Decorative (hidden on mobile) */}
  <div className="hidden xl:flex w-1/2 bg-gradient-to-br from-primary via-accent to-secondary">
    {/* Content centered with decorative blobs */}
  </div>

  {/* Right: Form */}
  <div className="w-full xl:w-1/2 bg-background">
    <Card>...</Card>
  </div>
</div>
```

---

## Forms

### Form Field Pattern
```jsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-foreground font-medium flex items-center gap-2">
        <Icon className="text-muted-foreground" />
        Label
      </FormLabel>
      <FormControl>
        <Input
          className="h-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
          {...field}
        />
      </FormControl>
      <FormMessage className="text-error text-sm" />
    </FormItem>
  )}
/>
```

### Password Field with Toggle
```jsx
<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="h-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg pr-12"
    {...field}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
```

---

## Animations

### Available Animations
```css
.animate-fade-in        /* Simple opacity fade */
.animate-fade-up        /* Fade + slide up */
.animate-scale-in       /* Fade + scale */
.animate-slide-in-right /* Fade + slide from right */
.animate-pulse-soft     /* Subtle pulsing */
```

### Transition Durations
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Common Usage
```jsx
// Hover transitions
className="transition-all duration-200"
className="transition-colors duration-200"
className="transition-transform duration-300"

// Hover scale effect
className="hover:scale-105 transition-transform duration-300"
```

---

## Dark Mode

Dark mode uses the `.dark` class on a parent element. All colors automatically adjust.

### Key Differences
| Property | Light | Dark |
|----------|-------|------|
| Background | `#FFFFFF` | `#0F172A` (slate-900) |
| Foreground | `#0F172A` | `#F8FAFC` (slate-50) |
| Primary | `#6366F1` (500) | `#818CF8` (400) |
| Cards | `#FFFFFF` | `#1E293B` (slate-800) |
| Borders | `#E2E8F0` (200) | `#334155` (700) |

---

## Quick Reference

### Color Classes Cheatsheet

```jsx
// Backgrounds
bg-background       // Page background
bg-muted           // Input/subtle background
bg-grey-x100       // Section background
bg-grey            // Dark background (footer)
bg-card            // Card background
bg-primary         // Brand primary
bg-secondary       // Brand secondary
bg-accent          // Brand accent

// Text
text-foreground           // Primary text
text-muted-foreground     // Secondary text
text-primary              // Brand primary text
text-error                // Error text
text-success              // Success text
text-primary-foreground   // White (on colored bg)

// Borders
border-border       // Standard border
border-primary      // Focus/active border
border-error/20     // Subtle error border

// Gradients
bg-gradient-to-r from-primary to-accent          // Horizontal
bg-gradient-to-br from-primary via-accent to-secondary  // Diagonal

// Opacity modifiers
bg-primary/5   // 5% opacity
bg-white/10    // 10% opacity (for blobs)
text-white/80  // 80% opacity text
```

### Component Height Standards
```jsx
h-10    // Small inputs/buttons (40px)
h-12    // Standard inputs/buttons (48px)
h-[68px] // Navbar height
```

### Breakpoints
```jsx
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

### Common Responsive Patterns
```jsx
// Hide on mobile, show on desktop
className="hidden xl:flex"

// Full width on mobile, half on desktop
className="w-full xl:w-1/2"

// Smaller text on mobile
className="text-2xl xl:text-3xl"

// Less padding on mobile
className="px-4 sm:px-8 lg:px-16"
```

---

## Feature-Specific Colors

### Goal Tracker
- Primary: `success` (#10B981 - emerald)
- Background: `success-x100` (#D1FAE5)
- Icon background: `bg-success/10`

### Expense Tracker
- Primary: `primary` (#6366F1 - indigo)
- Background: `primary-lite` (#EEF2FF)
- Icon background: `bg-primary/10`

### IOU Tracker
- Primary: `error` (#EF4444 - red)
- Background: `error-x100` (#FEE2E2)
- Icon background: `bg-error/10`

---

## File Reference

- **CSS Variables**: `client/src/index.css`
- **Tailwind Config**: Uses Tailwind v4 with `@theme inline`
- **UI Components**: `client/src/components/ui/` (shadcn/ui)

---

*Last updated: January 2026*
