---
name: MarkDeck
description: Transform markdown into presentation slides with a minimal, focused workflow.
colors:
  primary: oklch(0.2050 0 0)
  neutral-bg: oklch(0.9918 0.003 60)
  neutral-surface: oklch(0.9651 0.006 60)
  neutral-muted: oklch(0.9219 0.005 60)
  neutral-border: oklch(0.9219 0.005 60)
  neutral-foreground: oklch(0.1450 0 0)
  neutral-muted-foreground: oklch(0.5516 0.015 60)
  accent-red: oklch(0.5770 0.2450 27.3250)
  accent-blue: #0447ff
  accent-ember: #ff4704
typography:
  display:
    fontFamily: '"Waldenburg", "Cormorant Garamond", ui-serif, serif'
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: '"Geist Mono", ui-monospace, monospace'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 0.375rem
  md: 0.625rem
  lg: 1rem
  xl: 1.4rem
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: oklch(0.1450 0 0)
    textColor: "{colors.neutral-bg}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: 1px solid "{colors.neutral-border}"
  card-default:
    backgroundColor: oklch(1 0 0)
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: 1px solid "{colors.neutral-border}"
---

# Design System: MarkDeck

## 1. Overview

**Creative North Star: "The Reading Room"**

MarkDeck is a quiet, undistracted workspace for turning notes into slides. Like a well-kept reading room in a university library, it prioritizes function over ornament. The interface recedes so the content leads.

The visual system is monochromatic at its core — black, white, and near-whites — with color reserved exclusively for slide themes (26 distinct palettes applied per-presentation) and functional signals (destructive red, link blue). The chrome around the content (sidebar, header, dashboard) stays achromatic and minimal.

This system explicitly rejects the drag-and-drop design canvas aesthetic (Canva, et al.). There are no color pickers, no element selectors, no property panels. The editor is a textarea and a live preview.

The neutral ramp is tinted toward amber (oklch hue ~60°) at very low chroma — barely perceptible consciously, but providing subconscious warmth and cohesion. This supports the "Reading Room" north star: like warm lamplight on cream paper, the interface feels inviting without ever calling attention to itself.

**Key Characteristics:**
- Near-achromatic chrome with a warm-tinted neutral ramp, chromatic slide canvases
- 1rem (16px) radius on cards and dialogs — gently rounded, not pill-like
- Flat surfaces with tonal layering for depth; shadows reserved for interactive hover states and dialog overlays
- Serif display font for slide titles, sans body for UI — content is editorial, chrome is utilitarian

## 2. Colors

A deliberately restrained chrome palette with a warm undertone. The neutrals are tinted toward amber (oklch hue ~60°) at a very low chroma — barely perceptible consciously, but creating subconscious warmth and cohesion. Full chromatic range lives inside the 26 slide themes, not in the UI shell.

### Primary

- **Obsidian** (`oklch(0.2050 0 0)`): The sole primary accent. Used for buttons, active navigation items, and strong typographic emphasis. Pure black would feel harsh; this near-black has a fraction of lightness removed for a softer, ink-like appearance.

### Neutral

- **White** (`oklch(1 0 0)`): Page and card backgrounds. True white — no tint.
- **Eggshell** (`#fefcfa`, `oklch(0.9918 0.003 60)`): Page background. A whisper of warmth over pure white, tinted toward amber at a low chroma. Barely perceptible but sets the reading-room tone.
- **Powder** (`#f7f3ef`, `oklch(0.9651 0.006 60)`): Sidebar background, muted surfaces, secondary buttons, accent hover states. Warmer than eggshell, creating subtle layer distinction.
- **Chalk** (`#e8e4e2`, `oklch(0.9219 0.005 60)`): Borders and input strokes. Light enough to recede, warm enough to avoid the sterility of pure gray borders.
- **Fog** (`#b3b0ad`, `oklch(0.7580 0.005 60)`): Medium neutral for chart elements and secondary decorative borders. Quiet warmth.
- **Slate** (`#a69e99`, `oklch(0.7052 0.012 60)`): Ring color, disabled states, tertiary chart fills. The warmest of the mid-tone neutrals.
- **Gravel** (`#797069`, `oklch(0.5516 0.015 60)`): Muted foreground text — dates, descriptions, placeholder copy. The amber undertone is most visible here, giving it a warm taupe character.
- **Ink** (`oklch(0.1450 0 0)`): Body text, headings, icons. The darkest neutral, pushing near-black without hitting absolute zero.

### Semantic

- **Ember** (`oklch(0.5770 0.2450 27.3250)`): Destructive actions and error states. A desaturated red that reads as serious without alarm.
- **Signal Blue** (`#0447ff`): Interactive links and focus rings. High-contrast blue chosen for accessibility — only appears in actionable contexts.
- **Signal Ember** (`#ff4704`): The sole warm accent in the raw palette. Used sparingly for attention marks.

### Named Rules

**The Chromatic Firewall Rule.** The app chrome (sidebar, header, dashboard, editor shell) uses only the neutral ramp. All color lives inside slide themes, applied per-presentation via `data-theme`. No UI element outside the slide canvas may carry a theme color.

**The Warm Neutral Rule.** All neutral-ramp colors are tinted toward amber (oklch hue ~60°) at very low chroma (0.003–0.015). This provides subconscious warmth without reading as "colored." Avoid pure gray neutrals (0 chroma) in the UI shell — they feel sterile against the warm tint.

## 3. Typography

**Display Font:** Waldenburg (with Cormorant Garamond → ui-serif fallback)
**Body Font:** Inter (with ui-sans-serif → system-ui fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** A deliberate editorial bent. Waldenburg is a distinctive serif with personality — it gives slide titles weight and presence. Inter is a neutral, highly readable sans that stays out of the way for UI copy and body text. The pairing signals "content matters" without shouting.

### Hierarchy

- **Slide Title** (Display, 400, variable clamp, 1.0 line-height): The single largest type decision. Set at the slide level via theme tokens. Only used on slide canvases.

- **Headline** (Inter 600, 1.25rem, 1.2 line-height): Dashboard card titles, dialog headers, editor panel titles.

- **Title** (Inter 500, 1rem, 1.4 line-height): Section labels in the sidebar, list item titles.

- **Body** (Inter 400, 0.875rem, 1.5 line-height): Primary reading size for UI copy, descriptions, metadata. Cap line length at 65–75ch for prose blocks.

- **Small** (Inter 400, 0.75rem, 1.5 line-height): Secondary metadata, timestamps, badges. Never used for primary content.

- **Label** (Inter 500, 0.75rem, 1.0 line-height, uppercase): Button text, tab labels, form labels.

## 4. Elevation

A hybrid system — flat by default, shadowed on interaction. Resting surfaces sit at the same Z level; depth is communicated through tonal layering (background, off-white, powder) rather than drop shadows. Shadows appear only as a direct response to state.

### Shadow Vocabulary

- **`shadow-2xs`** (`0 1px 3px 0px hsl(0 0% 0% / 0.05)`): Inset ring on interactive elements. A subtle boundary, not a lift.
- **`shadow-sm`** (`0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)`): Resting state for cards and containers. A whisper of depth — present but not noticed.
- **`shadow-lg`** (`0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)`): Dialog overlays. A more pronounced lift to signal modal separation from page content.
- **`shadow-2xl`** (`0 1px 3px 0px hsl(0 0% 0% / 0.25)`): The highest elevation. Used sparingly — only for the slide preview canvas in the editor, where the frame needs to feel like a physical object.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state — button hover, dialog open, card hover. If an element doesn't change state, it doesn't cast a shadow.

## 5. Components

### Buttons
- **Shape:** Gently rounded (0.625rem / 10px). Not pill-like, not square.
- **Primary:** Obsidian background, white text. The single call-to-action per viewport.
- **Hover / Focus:** Darken background by 10% opacity. Focus ring uses Signal Blue (`#0447ff`) at 50% opacity, 3px width, matching border radius.
- **Outline:** Transparent background, Ink text, Chalk border. Hover fills with Powder background. Secondary action.
- **Ghost:** No border or background. Hover fills with Powder. Lowest visual weight.
- **Sizes:** default (h-9, 14px), sm (h-8, 13px), xs (h-6, 12px), lg (h-10, 14px), icon (h-9 w-9).
- **Disabled:** 50% opacity, no pointer events. No visual distinction between variant styles.

### Cards
- **Corner Style:** Rounded (1rem / 16px).
- **Background:** White. Elevated cards get an lg shadow at rest.
- **Border:** 1px solid Chalk (`oklch(0.9220 0 0)`).
- **Internal Padding:** 1.5rem (24px) on all sides via CardHeader, CardContent, CardFooter.
- **Header:** Title + optional action slot in a CSS grid layout. Auto-height for title, action pinned to top-right.
- **Footer:** Flex row with wrapping. Buttons inside the footer use sm size.

### Dialogs
- **Structure:** Overlay (50% black backdrop) + centered content panel.
- **Shape:** Rounded (1rem / 16px). Sharp enough to feel deliberate, soft enough not to feel alien.
- **Background:** White (`oklch(1 0 0)`).
- **Shadow:** lg elevation.
- **Animation:** Fade-in + zoom-in (95% → 100%) on open; reverse on close.
- **Header:** Center-aligned on mobile, left-aligned on desktop via `sm:text-left`.
- **Footer:** Column-reverse on mobile (Close on top), row on desktop (Close on left, actions on right).
- **Close:** Absolute positioned X icon in the top-right corner. 70% opacity resting, 100% on hover.

### Navigation (Sidebar)
- **Layout:** Fixed-width column (220px) on desktop, collapsible or hidden on mobile via CSS grid col change.
- **Background:** Off-white (`oklch(0.9850 0 0)`) — distinct from page white but not a different visual layer.
- **Items:** Flex row with 8px gap, 12px horizontal padding, 8px vertical. Transition-colors on interaction.
- **Active state:** Obsidian background, white text. Same as primary button.
- **Hover state:** Powder background fill.
- **Separation:** Right border (1px Chalk) divides sidebar from content area.

### Inputs / Fields
- **Style:** 1px Chalk border, transparent background, Chalk is the baseline. Focus shifts ring to Signal Blue at 50% opacity.
- **Height:** 36px (default), matching button height for inline layouts.
- **Focus:** 3px ring at 50% opacity in Signal Blue. No border color change — the ring is the feedback mechanism.
- **Error:** Border shifts to Ember (destructive red). Ring also uses Ember at 20% opacity (light) or 40% opacity (dark).
- **Disabled:** 50% opacity, no pointer events.

### Chips / Badges
- **Style:** Inline flex with small horizontal padding. Font size 0.75rem, medium weight.
- **Variants:** Outline (Chalk border, Ink text) is default. Default variant uses Obsidian bg + white text for emphasis. Secondary variant uses Powder bg.
- **Shape:** 0.375rem (6px) radius — slightly tighter than the system default.

## 6. Do's and Don'ts

### Do:
- **Do** use the warm-tinted neutral ramp for all app chrome. Color belongs on slide canvases, not in the UI shell.
- **Do** let the amber undertone in the neutrals create subconscious warmth — pure gray (0 chroma) looks sterile next to it.
- **Do** use Obsidian (near-black) as the sole primary button and active nav color. No accent hues in the toolbar.
- **Do** keep one call-to-action per viewport. Secondary actions use outline or ghost variants.
- **Do** rely on tonal layering (White → Off-white → Powder) for depth. Shadows are for interaction feedback only.
- **Do** use Waldenburg for slide titles and Inter for everything else. The serif/sans split is the system's defining personality axis.
- **Do** keep buttons to one of the six defined sizes. Custom sizing breaks the rhythm.

### Don't:
- **Don't** use color from a slide theme anywhere in the app chrome. Not in the sidebar, header, buttons, or navigation.
- **Don't** make MarkDeck feel like Canva — no drag-and-drop canvas, no element selection, no property panels, no visual editor.
- **Don't** use border-left greater than 1px as a colored accent stripe. Use full borders, background tints, or nothing.
- **Don't** apply glassmorphism, gradient text, or side-stripe borders anywhere in the system.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding.
- **Don't** use tiny uppercase tracked eyebrow text ("ABOUT", "PROCESS") above every section heading.
- **Don't** render identical card grids with same-sized icon + heading + text repeated endlessly.
- **Don't** let text overflow its container. Test heading copy at every breakpoint.
- **Don't** animate with bounce or elastic easing. Use ease-out-quart / quint / expo curves.
- **Don't** ship motion without a `prefers-reduced-motion: reduce` fallback.
