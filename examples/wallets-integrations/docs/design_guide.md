# CIFER Design Guide

A comprehensive guide for maintaining visual consistency across the CIFER website.

---

## 🎨 Color System

### Primary Colors (CSS Variables)

| Token | Value | Tailwind Equivalent | Usage |
|-------|-------|---------------------|-------|
| `--background` | `#09090b` | `zinc-950` | Page background |
| `--foreground` | `#f4f4f5` | `zinc-100` | Primary text |
| `--muted` | `#27272a` | `zinc-800` | Muted backgrounds, borders |
| `--muted-foreground` | `#a1a1aa` | `zinc-400` | Secondary/muted text |
| `--accent` | `#00ff9d` | Custom | Brand accent (Cyber Green) |
| `--accent-foreground` | `#09090b` | `zinc-950` | Text on accent backgrounds |
| `--card` | `#18181b` | `zinc-900` | Card backgrounds |
| `--card-foreground` | `#f4f4f5` | `zinc-100` | Card text |
| `--border` | `#27272a` | `zinc-800` | Default borders |

### Zinc Scale (Most Used)

```
zinc-950  #09090b  — Backgrounds (darkest)
zinc-900  #18181b  — Card backgrounds, elevated surfaces
zinc-800  #27272a  — Borders, icon backgrounds, dividers
zinc-600  #52525b  — Hover borders
zinc-500  #71717a  — Muted text (very subtle)
zinc-400  #a1a1aa  — Secondary text, icons
zinc-300  #d4d4d8  — Body text (readable)
zinc-100  #f4f4f5  — Headings, primary text
white     #ffffff  — High emphasis text
```

### Accent Usage Rules

- **DO**: Use accent (`#00ff9d`) for:
  - CTAs and primary buttons
  - Highlighted keywords in headings (one word max)
  - Checkmarks and success indicators
  - Hover states on interactive elements
  - Glow effects and visual flourishes

- **DON'T**: Use accent for:
  - Large blocks of text
  - Multiple words in a single heading
  - Body text
  - Backgrounds (except subtle 5-10% opacity overlays)

---

## 📐 Typography

### Font Stack

| Variable | Font | Usage |
|----------|------|-------|
| `--font-sans` | Geist | Body text, UI elements |
| `--font-mono` | Geist Mono | Code, technical content |
| `--font-logo` | Space Grotesk 700 | Logo wordmark only |

### Heading Sizes

| Element | Classes | Usage |
|---------|---------|-------|
| H1 | `text-5xl md:text-7xl font-bold` | Hero title only |
| H2 | `text-3xl md:text-5xl font-bold` | Section titles |
| H3 | `text-2xl font-bold` | Card titles, subsections |
| Card Title | `text-xl font-semibold` | Card headers |

### Body Text

| Type | Classes |
|------|---------|
| Lead paragraph | `text-lg md:text-xl text-zinc-300` |
| Body text | `text-xl text-zinc-400 leading-relaxed` |
| Description | `text-zinc-400 leading-relaxed` |
| Small/meta | `text-sm text-zinc-500` |
| Extra small | `text-xs text-zinc-500` |

### Heading Accent Pattern

Always highlight **ONE keyword** per heading with `text-accent`:

```tsx
// ✅ Correct
<h2>CIFER removes key ownership <span className="text-accent">entirely</span>.</h2>
<h2>Built for <span className="text-accent">scale</span>.</h2>

// ❌ Incorrect
<h2 className="text-accent">Built for scale.</h2>
<h2>Built for <span className="text-accent">scale and security</span>.</h2>
```

---

## 📦 Component Patterns

### Section Layout

```tsx
<Section className="bg-zinc-950 border-t border-zinc-900">
  <Container>
    {/* Content */}
  </Container>
</Section>
```

- Sections use `py-24` padding (from Container component)
- Use `border-t border-zinc-900` for section separators
- Background alternates: `bg-black` | `bg-zinc-950`

### Container

- Max width: `max-w-7xl`
- Padding: `px-4 sm:px-6 lg:px-8`

### Cards

```tsx
<Card className="bg-zinc-900/50 border-zinc-800 hover:border-accent/50">
```

| Property | Value |
|----------|-------|
| Background | `bg-zinc-900/50` or `bg-zinc-900/20` |
| Border | `border-zinc-800` |
| Border radius | `rounded-xl` |
| Hover border | `hover:border-accent/50` or `hover:border-zinc-600` |
| Padding | `p-6` (built into Card component) |

### Icon Containers (in Cards)

```tsx
<div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
  <Icon className="h-6 w-6 text-zinc-400" />
</div>
```

- Size: `h-12 w-12` container, `h-6 w-6` icon
- Background: `bg-zinc-800`
- Icon color: `text-zinc-400`
- On hover (optional): `group-hover:bg-accent/10` + `group-hover:text-accent`

### Buttons

| Variant | Use Case |
|---------|----------|
| `accent` | Primary CTA (one per section max) |
| `outline` | Secondary actions |
| `ghost` | Tertiary/navigation |
| `default` | Alternative primary (white bg) |

| Size | Classes |
|------|---------|
| `sm` | `h-9 px-3 text-xs` |
| `default` | `h-10 px-4 py-2 text-sm` |
| `lg` | `h-12 px-8 text-base` |

---

## ✨ Effects & Motion

### Glow Utilities

```css
.text-glow {
  text-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
}

.border-glow {
  box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
}
```

### Accent Button Glow

```tsx
shadow-[0_0_20px_rgba(0,255,157,0.3)]
hover:shadow-[0_0_30px_rgba(0,255,157,0.5)]
```

### Blur Effects

- Background blur: `bg-accent/20 blur-[100px]` for ambient glow
- Card backdrop: `backdrop-blur-sm`
- Header backdrop: `backdrop-blur-xl`

### Framer Motion Patterns

| Animation | Values |
|-----------|--------|
| Fade in + slide up | `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` |
| Fade in + slide left | `initial={{ opacity: 0, x: -20 }}` → `animate={{ opacity: 1, x: 0 }}` |
| Button hover | `whileHover={{ scale: 1.02 }}` |
| Button tap | `whileTap={{ scale: 0.98 }}` |
| Cards in viewport | `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true }}` |
| Duration | `0.5s` - `0.6s` standard, `0.8s` for hero elements |

---

## 🧩 Layout Grid

### Hero Section

```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
```

### Card Grids

```tsx
<div className="grid md:grid-cols-3 gap-8">
```

### Content + Visual (50/50)

```tsx
<div className="grid lg:grid-cols-2 gap-16 items-center">
```

### Centered Text Blocks

```tsx
<div className="text-center max-w-3xl mx-auto mb-16">
```

---

## 🔤 Text Color Hierarchy

| Priority | Tailwind Class | Use |
|----------|----------------|-----|
| 1 (Highest) | `text-white` | Headings, titles |
| 2 | `text-zinc-300` | Body text, list items |
| 3 | `text-zinc-400` | Descriptions, paragraphs |
| 4 | `text-zinc-500` | Meta text, captions, labels |
| Accent | `text-accent` | Highlighted keywords, CTAs |

---

## 📏 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `mb-2` | 8px | Tight spacing (label to content) |
| `mb-4` | 16px | Between related elements |
| `mb-6` | 24px | Between heading and paragraph |
| `mb-8` | 32px | Between content groups |
| `mb-12` | 48px | Section intro to content |
| `mb-16` | 64px | Section header to grid |
| `gap-4` | 16px | Button groups |
| `gap-8` | 32px | Card grids |
| `gap-12` | 48px | Hero grid |
| `gap-16` | 64px | Two-column layouts |

---

## 🚫 Anti-Patterns to Avoid

1. **No red colors** — Removed from design system
2. **No multiple accent words** — One highlighted word per heading
3. **No accent body text** — Only for CTAs and single keywords
4. **No inline styles** — Use Tailwind classes (except `fontFamily` for logo)
5. **No custom colors** — Stick to zinc scale + accent
6. **No inconsistent spacing** — Use the spacing scale above
7. **No orphaned sections** — Always use Container + Section wrappers
8. **No hard-coded shadows** — Use the glow utilities or Tailwind
9. **No `<img>` tags** — Always use `next/image` for optimization

---

## ✅ Checklist for New Components

- [ ] Uses `Container` and `Section` wrappers
- [ ] Follows zinc color scale
- [ ] Headings use `text-white`, one word in `text-accent`
- [ ] Body text is `text-zinc-400` with `leading-relaxed`
- [ ] Cards use `bg-zinc-900/50 border-zinc-800`
- [ ] Icons are `text-zinc-400` in `bg-zinc-800` containers
- [ ] Buttons follow variant system
- [ ] Motion uses standard fade + slide patterns
- [ ] Spacing follows the scale
- [ ] No red or off-brand colors
