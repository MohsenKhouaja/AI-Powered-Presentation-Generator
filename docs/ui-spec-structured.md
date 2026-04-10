# P2M - LLM-Readable UI Specification

## Project Overview

**Type:** SaaS web application
**Core Function:** Transform Markdown into beautifully rendered presentation slides
**Target Users:** Content creators, educators, professionals who prefer writing in Markdown

## Design Direction

**Primary Aesthetic:** Modern minimalist black & white

**Principles:**
- Dominant: Pure black (#000000), pure white (#FFFFFF), and grays (#1a1a1a, #2a2a2a, #f5f5f5, #fafafa)
- Accent: Reserved for interactive elements only (buttons, links, focus states)
- Accent colors: Single accent per theme (blue #3B82F6 default and green #7f872d , customizable per theme)
- Typography: High contrast, clean sans-serif (Inter)
- Spacing: Generous whitespace, breathing room
- Borders: Subtle, thin (1px), monochrome
- Shadows: Minimal, soft, monochrome only
- Animations: Subtle, fast, monochrome

**Color Usage Rules:**
```
- Background: White (#FFFFFF) or light gray (#fafafa)
- Text: Black (#000) or dark gray (#333) - NEVER gray text on gray
- Cards/Panels: White with subtle border or very light shadow
- Buttons: Black background, white text (primary) OR outlined
- Accent color: Only for focus rings, active states, selected items
- Hover states: Slight background shift (white -> #f5f5f5)
- Dividers: Light gray (#e5e5e5) or border style
```

**Dark Mode Adaptation:**
```
- Background: Near-black (#0a0a0a, #111111)
- Text: White (#fff) or light gray (#a3a3a3)
- Cards: Slightly lighter black (#1a1a1a, #222)
- Borders: Dark gray (#2a2a2a)
- Same accent color principle applies
```

---

## Application Routes

```
/                       -> Landing Page (unauthenticated)
/dashboard              -> Dashboard (authenticated)
/presentations/:id      -> Presentation Viewer (authenticated)
/presentations/:id/edit  -> Presentation Editor (authenticated)
/settings/themes        -> Theme Customizer (authenticated)
/shared                 -> Shared Presentations (authenticated)
```

---

## Pages

### PAGE: landing

**route:** `/`
**auth_required:** false
**description:** Entry point for unauthenticated users with embedded auth form

**layout_sections:**
```
header: minimal (logo, sign in button)
main: hero_section + auth_form
footer: minimal (copyright, links)
```

**hero_section:**
- headline: "MARKDOWN TO PRESENTATION"
- tagline: "Transform your ideas into stunning slides with the simplicity of Markdown"
- cta_button: "Get Started Free" (opens register tab)
- black and white painting with the clear transition from md text to component

**auth_form_component:** auth_form

---

### PAGE: dashboard

**route:** `/dashboard`
**auth_required:** true
**description:** Central hub showing user's presentations in a card grid

**layout_sections:**
```
header: search_bar, theme_toggle, user_menu
sidebar: navigation_menu
main: welcome_header, presentation_grid
```

**navigation_menu_items:**
```
- { id: "home", label: "Home", icon: "house", route: "/dashboard" }
- { id: "all", label: "All Presentations", icon: "folder", route: "/dashboard" }
- { id: "shared", label: "Shared With Me", icon: "users", route: "/shared" }
- divider
- { id: "settings", label: "Settings", icon: "cog", route: "/settings" }
- { id: "themes", label: "Theme Customizer", icon: "palette", route: "/settings/themes" }
- divider
- { id: "logout", label: "Logout", icon: "arrow-right-on-rectangle" }
```

**presentation_card:**
```
dimensions: 320x240px
content:
  - preview_thumbnail: image (first slide render)
  - title: text
  - metadata: "N slides • Updated X time ago"
  - footer: avatar + share_button + overflow_menu
states: [default, hover, loading_skeleton]
actions:
  - click: navigate to viewer
  - share button: open share dialog
  - overflow menu: [Edit, Duplicate, Delete]
```

**empty_state:**
```
icon: "chart-bar"
headline: "No presentations yet"
description: "Start by creating your first presentation."
cta_button: "Create Presentation"
```

---

### PAGE: presentation_viewer

**route:** `/presentations/:id`
**auth_required:** true
**description:** Fullscreen slide presentation mode

**layout_sections:**
```
fullscreen_canvas: slide_content (100vw x 100vh)
bottom_bar: navigation_controls
```

**slide_content:**
```
dimensions: 100% of viewport
content: rendered_markdown (react-markdown)
constraints: centered, max-width 1200px, padding 48px
```

**navigation_controls:**
```
position: bottom center, fixed
components:
  - prev_button: "←" (disabled on slide 1)
  - slide_indicators: dots (current filled, others outlined)
  - next_button: "→" (disabled on last slide)
  - progress_bar: "████████░░░░░░░░░ 3/10"
  - exit_button: "Esc to Exit" (top right corner)
keyboard_shortcuts:
  - "ArrowLeft": previous slide
  - "ArrowRight": next slide
  - "Escape": exit viewer
  - "F": toggle fullscreen
```

**states:**
```
- slide_1: prev_button hidden
- slide_last: next_button hidden
- transitioning: 300ms ease slide animation
```

---

### PAGE: presentation_editor

**route:** `/presentations/:id/edit`
**auth_required:** true
**description:** Split-pane markdown editor with live preview

**layout_sections:**
```
toolbar: back_button, title_input, preview_button, save_button, share_button
sidebar: context_panel (collapsible)
main_split:
  left: markdown_editor
  right: live_preview
  bottom: slide_navigator
```

**toolbar:**
```
components:
  - back_button: icon "arrow-left"
  - title_input: text input (editable inline)
  - divider
  - preview_button: "Preview" (toggles preview mode)
  - save_button: "Save" (shows "Saved" on success)
  - share_button: icon "share"
```

**context_panel (sidebar, 280px width):**
```
sections:
  - section: "Context"
    description: "Add files or prompts to inform AI generation"
    components:
      - file_upload_zone
      - ai_generate_button: "✨ Generate Slides with AI"
  
  - section: "Files"
    description: "Attached reference files"
    components:
      - file_list: [icon, filename, size, delete_button]
      - supported_types: ["PDF", "DOCX", "TXT", "MD", "PNG", "JPG"]
      - max_size: "10MB"
  
  - section: "Theme"
    description: "Current presentation theme"
    components:
      - theme_selector_dropdown
```

**file_upload_zone:**
```
default_state:
  icon: "paper-clip"
  text: "Drop files here or click to upload"
  subtext: "PDF, DOCX, TXT, MD, PNG, JPG up to 10MB"
  border: dashed, rounded-lg

drag_over_state:
  border: solid, highlighted background
  text: "Drop to upload"

uploading_state:
  progress_bar: percentage filled
  filename: displayed

success_state:
  checkmark_icon
  filename: displayed
  remove_button

error_state:
  error_icon (red)
  error_message
  retry_button
```

**markdown_editor:**
```
dimensions: 50% width, 100% height minus toolbar and navigator
features:
  - syntax highlighting for markdown
  - line numbers
  - auto-save indicator
  - font: monospace
```

**live_preview:**
```
dimensions: 50% width, 100% height minus toolbar and navigator
features:
  - real-time markdown render
  - theme applied
  - responsive scaling
  - border around slide area
```

**slide_navigator:**
```
position: bottom of editor, full width
height: 80px
components:
  - slide_thumbnails: horizontal scrollable
    - thumbnail: 120x68px (16:9 ratio)
    - slide_number_badge: top-left corner
    - states: [default, active (highlighted border), hover (show delete)]
    - drag_handle: for reordering
  - add_slide_button: "+" icon, right side
```

---

### PAGE: theme_customizer

**route:** `/settings/themes`
**auth_required:** true
**description:** Browse and preview available presentation themes

**layout_sections:**
```
header: back_button, title
main:
  - current_theme_selector
  - theme_grid
  - preview_slide
```

**current_theme_selector:**
```
type: dropdown with search
placeholder: "Search themes..."
themes_available: 25 themes (from lib/themes.ts)
```

**theme_grid:**
```
layout: responsive grid (4 columns desktop, 2 tablet, 1 mobile)
card_per_theme:
  dimensions: 200x150px
  content:
    - preview_box: sample slide with theme colors
    - theme_name: text
    - apply_button: appears on hover
```

**preview_slide:**
```
dimensions: full width, 400px height
content: sample markdown rendered with selected theme
actions:
  - apply_button: "Apply Theme"
```

---

### PAGE: shared_presentations

**route:** `/shared`
**auth_required:** true
**description:** List of presentations shared with the user by others

**layout_sections:** (same as dashboard)
```
header: same as dashboard
sidebar: same as dashboard (Shared item active)
main: shared_presentations_grid
```

**difference_from_dashboard:**
```
- grid item shows "Shared by: [Owner Name]"
- access_badge: "View" or "Edit" based on permission
- filter_dropdown: "All", "Can View", "Can Edit"
```

---

## Components

### COMPONENT: auth_form

**file:** `src/components/authForm.tsx`
**props:** none (uses AuthContext)

**structure:**
```
tabs: [login, register]
active_tab: state

login_form_fields:
  - email: email input (required, validated)
  - password: password input (required, min 8 chars)

register_form_fields:
  - username: text input (required, 3-20 chars)
  - email: email input (required, validated)
  - password: password input (required, min 8 chars)
  - confirm_password: password input (must match)

submit_button:
  text: "Login" or "Create Account"
  state: default | loading (spinner) | disabled

error_display:
  type: inline error below relevant field
  style: red text, red border on input

forgot_password_link:
  visible: on login tab only
  text: "Forgot password?"
```

**visual_design:**
```
- Background: white (#FFFFFF)
- Border: 1px solid #e5e5e5
- Border-radius: 6px
- Shadow: very subtle (0 1px 2px rgba(0,0,0,0.05))
- Tabs: underline style, accent color when active
- Inputs: white bg, gray border (#e5e5e5), black text
- Button: black bg (#000), white text, full width
- Hover on button: slight opacity change (0.9)
```
tabs: [login, register]
active_tab: state

login_form_fields:
  - email: email input (required, validated)
  - password: password input (required, min 8 chars)

register_form_fields:
  - username: text input (required, 3-20 chars)
  - email: email input (required, validated)
  - password: password input (required, min 8 chars)
  - confirm_password: password input (must match)

submit_button:
  text: "Login" or "Create Account"
  state: default | loading (spinner) | disabled

error_display:
  type: inline error below relevant field
  style: red text, red border on input

forgot_password_link:
  visible: on login tab only
  text: "Forgot password?"
```

**states:**
```
- login_tab_active
- register_tab_active
- submitting
- error: { field: string, message: string }
- success: redirect to /dashboard
```

---

### COMPONENT: presentation_card

**file:** `src/components/ui/card.tsx` (extends)
**usage:** dashboard, shared pages

**props:**
```typescript
interface PresentationCardProps {
  id: string;
  title: string;
  slideCount: number;
  updatedAt: Date;
  ownerName?: string; // for shared presentations
  accessType?: "view" | "edit"; // for shared presentations
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}
```

**visual_design:**
```
- Background: white (#FFFFFF)
- Border: 1px solid #e5e5e5
- Border-radius: 8px
- Shadow: very subtle (0 1px 2px rgba(0,0,0,0.04))
- Preview area: grayscale or black/white slide thumbnail
- Title: 600 weight, black (#000)
- Metadata: gray (#737373), small text
- Actions: appear on hover, icon only, subtle gray icons
- Hover: border becomes slightly darker (#d4d4d4)
```

**states:**
```
- default: clean card, minimal shadow
- hover: border darkens, actions fade in
- loading: skeleton with gray pulsing
- empty_preview: geometric pattern in grayscale
```

**states:**
```
- default: card with shadow-sm
- hover: elevated shadow, action buttons visible
- loading: skeleton placeholder
- empty_preview: gradient placeholder
```

---

### COMPONENT: markdown_renderer

**file:** `src/components/markdownRenderer.tsx`
**purpose:** Render markdown to styled React elements

**visual_design (Presentation Slides):**
```
- Background: white (#FFFFFF) or theme accent light
- h1: 50px, 800 weight, black, optional bottom border
- h2: 35px, 700 weight, accent left border (2px)
- h3: 30px, 600 weight, black
- Body: 16px, dark gray (#333), line-height 1.75
- Lists: subtle bullet colors from theme
- Blockquotes: light gray bg, accent left border
- Code: black text, light gray bg, subtle border
- Tables: minimal borders, header bg gray
- Images: full width, rounded corners (4px)
```

**custom_element_mappings:**
```
h1: large heading (50px), bold, thin bottom border
h2: medium heading (35px), accent left border (4px), subtle bg
h3: small heading (30px), semibold, black
p: body text (16-18px), dark gray (#333), generous line-height
strong: bold, black
ul: subtle gray bullets/markers
li: proper spacing, dark text
blockquote: light gray background, left accent border, italic
table: bordered, header light gray bg, clean lines
a: black text, underline on hover, accent color focus ring
img: card with subtle border, optional caption
code: inline code with light bg, dark text
pre: code block with syntax highlighting (grayscale base)
```

**theme_support:**
```
- Reads current theme from ThemeContext
- Theme ONLY affects accent color (borders, highlights, markers)
- All text remains black/white/gray scale
- Background stays white or very light tint
- Clean, readable, professional appearance
```
p: body text (16px), muted foreground, generous line-height
strong: bold text, primary foreground
ul: bulleted list, colorful markers
li: list item with proper spacing
blockquote: styled alert box with "Insight" label
table: shadcn Table component with borders
a: link button with hovercard preview
img: card with image and caption footer
code: syntax highlighted code block
pre: code block with language label
```

**theme_support:**
```
- Reads current theme from ThemeContext
- Applies CSS variables from theme file
- Supports dark/light tone switching
```

---

### COMPONENT: slide_navigator

**file:** `src/components/ui/slide-navigator.tsx` (new)
**usage:** presentation_editor

**props:**
```typescript
interface SlideNavigatorProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onSlideAdd: () => void;
  onSlideDelete: (index: number) => void;
  onSlideReorder: (fromIndex: number, toIndex: number) => void;
}
```

**visual:**
```
- Background: #fafafa (light mode) / #111 (dark mode)
- Border-radius: 6px
- Thumbnails: 16:9 ratio, 120x68px
- Active: accent color border (2px solid)
- Slide number: small badge, black text
- Delete button: appears on hover, gray icon
- Add button: dashed border, black + icon
- Scrollable: horizontal, minimal scrollbar
```

**states:**
```
- default: thumbnails displayed
- active: current slide highlighted with accent border
- hover: delete button appears on thumbnail
- dragging: thumbnail lifted with shadow
- reordering: placeholder shown
```

**visual:**
```
- Horizontal scrollable container
- Each slide: 120x68px thumbnail
- Active slide: blue border highlight
- Hover: show delete X button
- Add button: "+" at the end
```

---

### COMPONENT: theme_selector

**file:** `src/components/ui/theme-dropdown.tsx` (existing)
**props:**
```typescript
interface ThemeSelectorProps {
  value: string;
  onChange: (themeId: string) => void;
}
```

**features:**
```
- Searchable dropdown
- Shows theme preview swatch
- Currently selected marked with checkmark
```

---

### COMPONENT: file_upload_zone

**file:** `src/components/ui/file-upload.tsx` (new)
**usage:** presentation_editor sidebar

**props:**
```typescript
interface FileUploadZoneProps {
  contextId: string;
  onUploadComplete: (file: File) => void;
  onUploadError: (error: string) => void;
  acceptedTypes: string[];
  maxSize: number; // bytes
}
```

**states:**
```
- idle: dashed border, upload icon, instruction text
- drag_over: solid border, highlighted background
- uploading: progress bar, filename, cancel button
- success: checkmark, filename, file details
- error: error icon, error message, retry button
```

---

### COMPONENT: share_dialog

**file:** `src/components/ui/share-dialog.tsx` (new)
**usage:** presentation_card overflow menu, editor toolbar

**props:**
```typescript
interface ShareDialogProps {
  presentationId: string;
  presentationTitle: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**sections:**
```
1. shareable_link:
   - current_link_display: read-only input with copy button
   - generate_link_button: creates public link
   - link_toggle: enable/disable public access

2. collaborators_list:
   - list_items: avatar, email, access_badge, remove_button
   - access_badge: "Can view" (blue) | "Can edit" (green)

3. invite_form:
   - email_input: text input
   - access_dropdown: [Can view, Can edit]
   - invite_button: "Invite"
   - expiry_picker: optional date picker
```

---

### COMPONENT: ai_generation_modal

**file:** `src/components/ui/ai-generation-modal.tsx` (new)
**purpose:** Show progress during AI slide generation

**props:**
```typescript
interface AIGenerationModalProps {
  isOpen: boolean;
  progress: number; // 0-100
  currentStep: string; // e.g., "Creating slide 3 of 8..."
  statusMessage: string; // e.g., "Designing the introduction slide..."
  onCancel: () => void;
}
```

**visual:**
```
- modal overlay (dark semi-transparent)
- centered card:
  - icon: sparkle animation
  - headline: "Generating Slides"
  - progress_bar: animated fill
  - percentage: "60%"
  - current_step: "Creating slide 3 of 8..."
  - status_message: quoted text describing current action
  - cancel_button: "Cancel"
```

---

### COMPONENT: empty_state

**file:** `src/components/ui/empty.tsx` (existing)
**props:**
```typescript
interface EmptyStateProps {
  icon: string; // emoji or Lucide icon name
  headline: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**visual_design:**
```
- Icon: grayscale, muted (#a3a3a3)
- Headline: 600 weight, black, centered
- Description: gray (#737373), centered
- Button: black bg, white text
- Centered layout, generous padding
```

---

## Design System - Black & White Aesthetic

### Core Principles

```
1. MONOCHROME DOMINANCE
   - 90% of UI uses black, white, and grays only
   - Colors: #000, #111, #333, #525, #737, #a3a3a3, #d4d4d4, #e5e5e5, #f5f5f5, #fff

2. ACCENT RESERVATION
   - Accent color ONLY for: buttons, links, focus rings, selected states
   - Default accent: blue (#3B82F6)
   - Themes can change accent per presentation
   - Never use accent for decorative elements

3. HIGH CONTRAST
   - Text always readable: black on white, white on black
   - Never gray text on gray background
   - Minimum contrast ratio: 7:1 for body text

4. MINIMAL DECORATION
   - No gradients (except slide backgrounds if theme provides)
   - No drop shadows on text
   - Subtle borders instead of shadows
   - Simple geometric shapes only

5. GENEROUS WHITESPACE
   - More space than you think needed
   - Content breathes
   - Clear visual hierarchy through size and weight, not color
```

### Component Color Guidelines

```

### Typography in B&W Context

```
- All headings: black (#000) or white (#fff) - NEVER gray
- Body text: dark gray (#333) or light gray (#d4d4d4)
- Muted text: medium gray (#737)
- Placeholder text: light gray (#a3a3a3)
- Links: black with underline, accent on hover/focus
```

### Button Styles

```
PRIMARY (Main Actions):
  Background: #000 (light) / #FFF (dark)
  Text: #FFF (light) / #000 (dark)
  Border: none
  Hover: opacity 0.9
  
SECONDARY (Secondary Actions):
  Background: transparent
  Border: 1px solid #E5E5E5 (light) / #333 (dark)
  Text: #000 (light) / #FFF (dark)
  Hover: background #F5F5F5 (light) / #1A1A1A (dark)

GHOST (Tertiary Actions):
  Background: transparent
  Border: none
  Text: #737373
  Hover: text #000 (light) / #FFF (dark)

DESTRUCTIVE (Delete):
  Background: #EF4444 (error red)
  Text: #FFF
  Only used for destructive actions
```

### Icon Guidelines

```
- Style: Outline only (no filled icons)
- Color: #737373 default, #000 on hover
- Size: 16px (small), 20px (medium), 24px (large)
- Stroke width: 1.5px or 2px
- Examples: Lucide icons, Heroicons outline
```

### Layout Principles

```
SIDEBAR:
  Background: #FAFAFA (light) / #0A0A0A (dark)
  Border: 1px solid #E5E5E5 (right side)
  Width: 240px (desktop), collapsed on mobile
  
CARDS:
  Background: white
  Border: 1px solid #E5E5E5
  Border-radius: 8px
  Padding: 24px
  Gap between cards: 16px
  
MODALS/DIALOGS:
  Background: white
  Border: 1px solid #E5E5E5
  Border-radius: 8px
  Shadow: 0 4px 16px rgba(0,0,0,0.1)
  Overlay: rgba(0,0,0,0.5)
  
FORMS:
  Label: black, 500 weight
  Input: white bg, gray border, black text
  Error: red border, red text below
  Spacing: 16px between fields
```

---

## Data Models

### PRESENTATION
```typescript
interface Presentation {
  id: string; // uuid
  title: string;
  user_id: string; // owner uuid
  created_at: Date;
  updated_at?: Date;
}
```

### SLIDE
```typescript
interface Slide {
  id: string; // uuid
  presentation_id: string;
  content: string; // markdown content
  slide_order: number;
}
```

### CONTEXT
```typescript
interface Context {
  id: string; // uuid
  presentation_id: string;
  prompt: string; // AI generation prompt
}
```

### FILE
```typescript
interface File {
  id: string; // uuid
  context_id: string;
  storage_key: string; // S3/storage path
  mime_type: string;
  file_type: string;
  size_bytes: number;
}
```

### USER
```typescript
interface User {
  id: string; // uuid
  username: string;
  email: string;
}
```

### PRESENTATION_ACCESS
```typescript
interface PresentationAccess {
  id: string; // uuid
  user_id: string;
  presentation_id: string;
  access_type: "view" | "edit";
  expires_at?: Date;
}
```

---

## User Flows (Structured)

### FLOW: authentication

```
START: User visits /
  IF authenticated -> redirect to /dashboard
  
STEP: User sees landing page
  - hero section displayed
  - auth_form shown with login tab active
  
STEP: User selects Login or Register tab
  
STEP: User fills form fields
  - real-time validation
  - error states shown inline
  
STEP: User submits form
  - button shows loading state
  - form inputs disabled
  
BRANCH: On success
  - JWT token stored
  - redirect to /dashboard
  
BRANCH: On error
  - error message displayed
  - form re-enabled
  - user can retry

END: User authenticated
```

### FLOW: create_presentation

```
START: User clicks "+" or "New Presentation" on dashboard

STEP: Modal opens
  - title input focused
  - optional fields collapsed by default

STEP: User enters title (required)

STEP: User optionally:
  - adds context prompt in textarea
  - uploads reference files via dropzone
  - selects theme from dropdown

STEP: User clicks "Create →" button

BRANCH: No AI generation
  - creates empty presentation
  - redirects to /presentations/:id/edit

BRANCH: With AI generation
  - opens ai_generation_modal
  - calls backend AI endpoint
  - shows real-time progress
  - on complete: redirects to editor

END: Presentation created
```

### FLOW: edit_presentation

```
START: User navigates to /presentations/:id/edit

STEP: Page loads
  - fetch presentation data
  - fetch slides
  - fetch context and files
  - display in split editor

STEP: User edits markdown in editor pane
  - live preview updates in real-time
  - auto-save triggers after 2s of inactivity

STEP: User interacts with context panel
  - upload files
  - trigger AI generation
  - change theme

STEP: User manages slides via navigator
  - click thumbnail to switch slides
  - drag to reorder
  - click + to add new
  - click X to delete

STEP: User clicks Save or auto-save completes
  - save indicator shows "Saved"

END: Changes persisted
```

### FLOW: view_presentation

```
START: User clicks presentation card OR clicks "Preview" in editor

STEP: Viewer opens
  - fullscreen mode
  - slide 1 displayed

STEP: User navigates
  - click next/prev buttons
  - use arrow keys
  - click slide indicators
  - swipe on touch devices

STEP: User presses Escape or Exit button

END: Return to previous page
```

### FLOW: share_presentation

```
START: User clicks share button (card or editor)

STEP: Share dialog opens

STEP: User generates public link
  - toggle public access on/off
  - copy link to clipboard

STEP: User invites collaborator
  - enter email address
  - select access level (view/edit)
  - optionally set expiry
  - click invite

BRANCH: Existing user
  - access granted immediately
  - collaborator can see in their shared list

BRANCH: Non-existent email
  - invitation sent (future feature)
  - or error: "User not found"

STEP: User closes dialog

END: Access configured
```

---

## API Endpoints (Frontend Integration)

### Authentication
```
POST /api/auth/register  -> { token, user }
POST /api/auth/login     -> { token, user }
POST /api/auth/logout    -> { success }
POST /api/auth/refresh   -> { token }
```

### Presentations
```
GET    /api/presentations           -> Presentation[]
POST   /api/presentations           -> Presentation
GET    /api/presentations/:id       -> Presentation
PUT    /api/presentations/:id       -> Presentation
DELETE /api/presentations/:id       -> { success }
```

### Slides
```
GET    /api/presentations/:id/slides     -> Slide[]
POST   /api/presentations/:id/slides      -> Slide
PUT    /api/slides/:id                    -> Slide
DELETE /api/slides/:id                    -> { success }
POST   /api/presentations/:id/generate    -> Slide[] (AI generation)
```

### Contexts
```
GET    /api/presentations/:id/context     -> Context
PUT    /api/presentations/:id/context     -> Context
```

### Files
```
POST   /api/contexts/:id/files             -> File (upload)
DELETE /api/files/:id                     -> { success }
```

### Access
```
GET    /api/presentations/:id/access       -> PresentationAccess[]
POST   /api/presentations/:id/access       -> PresentationAccess
DELETE /api/access/:id                     -> { success }
POST   /api/presentations/:id/share-link   -> { shareUrl }
```

---

## Design Tokens (CSS Variables)

### Colors - Light Mode (Default)
```css
--background: #FFFFFF;
--foreground: #000000;
--card: #FFFFFF;
--card-foreground: #000000;
--secondary: #F5F5F5;
--muted: #FAFAFA;
--muted-foreground: #525252;
--border: #E5E5E5;
--input: #F5F5F5;
--accent: #F5F5F5; /* subtle bg for selected/hover */

/* Primary = Accent (reserved for interactive elements only) */
--primary: #3B82F6;
--primary-foreground: #FFFFFF;
--ring: #3B82F6; /* focus ring only */

/* Destructive still uses red for warnings */
--destructive: #EF4444;
--destructive-foreground: #FFFFFF;
```

### Colors - Dark Mode
```css
--background: #0A0A0A;
--foreground: #FFFFFF;
--card: #111111;
--card-foreground: #FFFFFF;
--secondary: #1A1A1A;
--muted: #171717;
--muted-foreground: #A3A3A3;
--border: #262626;
--input: #1A1A1A;
--accent: #1A1A1A;

--primary: #3B82F6;
--primary-foreground: #FFFFFF;
--ring: #3B82F6;

--destructive: #EF4444;
--destructive-foreground: #FFFFFF;
```

### Typography
```css
--font-sans: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
/* Note: Use generous spacing for modern feel */
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
/* Note: Subtle rounding, not pill-shaped */
```

### Shadows (Minimal)
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.1);
/* Note: Monochrome only, very subtle */
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* sidebar -> bottom navigation
     grid -> 1 column
     editor -> stacked (editor on top, preview below) */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* sidebar -> collapsible
     grid -> 2 columns */
}

/* Desktop */
@media (min-width: 1024px) {
  /* full sidebar
     grid -> 3 columns
     editor -> side-by-side */
}
```

---

## Accessibility Requirements

```
- color_contrast: WCAG AA minimum (4.5:1)
- focus_rings: visible, use --ring color
- keyboard_nav: full tab navigation, Escape closes
- aria_labels: all interactive elements labeled
- reduced_motion: respect prefers-reduced-motion
- alt_text: all images require descriptions
```

---

## Animation Specifications

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-spinner: 1000ms; /* for loops */

--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

---

## File Structure

```
frontend/src/
├── App.tsx                          # Root with providers
├── main.tsx                         # Entry point
├── index.css                        # Tailwind + theme imports
├── demo.md                          # Sample markdown
│
├── components/
│   ├── authForm.tsx                 # Login/Register form
│   ├── markdownRenderer.tsx         # MD to React renderer
│   ├── ThemeButton.tsx              # Theme option button
│   ├── ThemeDropdown.tsx            # Theme selector
│   ├── ThemeToggle.tsx              # Dark/light toggle
│   ├── hoverCard.tsx               # Interactive hover card
│   │
│   └── ui/                         # Shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── tabs.tsx
│       ├── sidebar.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── ... (full shadcn lib)
│
├── context/
│   ├── AuthContext.tsx              # Auth types
│   ├── AuthProvider.tsx             # Auth state + fetchwithauth
│   ├── ThemeContext.tsx             # Theme types
│   └── ThemeProvider.tsx            # Theme state
│
├── hooks/
│   └── use-mobile.ts                # Responsive hook
│
├── lib/
│   ├── utils.ts                     # cn() utility
│   └── themes.ts                    # 25 theme definitions
│
└── themes/                          # Theme CSS files (25)
    ├── default.css
    ├── ocean-breeze.css
    ├── forest-green.css
    └── ...
```

---

## Implementation Priority

```
PHASE 1: Core Structure
  1. Setup react-router-dom
  2. Create page components (Landing, Dashboard, Viewer, Editor)
  3. Implement AuthContext with routing
  4. Build sidebar navigation

PHASE 2: Presentation CRUD
  5. Presentation card component
  6. Dashboard with presentation list
  7. Create presentation modal
  8. Delete presentation

PHASE 3: Editor
  9. Split pane editor layout
  10. Markdown editor component
  11. Live preview (markdownRenderer)
  12. Slide navigator
  13. Auto-save functionality

PHASE 4: File & AI
  14. File upload zone
  15. Context panel
  16. AI generation modal
  17. AI generation integration

PHASE 5: Sharing & Polish
  18. Share dialog
  19. Shared presentations page
  20. Theme customizer
  21. Empty states
  22. Loading skeletons
  23. Error handling
```

---

*Document Version: 1.0 - LLM-Optimized Format*
