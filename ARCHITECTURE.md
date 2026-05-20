# DVC React — Architecture & Code Documentation

A deep-dive into how every file works, how data flows through the system, and how the rendering engine converts Figma coordinates into a fully responsive digital visiting card.

---

## Table of Contents

- [System Overview](#system-overview)
- [File Map](#file-map)
- [Data Flow](#data-flow)
- [Boot Sequence](#boot-sequence)
- [File-by-File Breakdown](#file-by-file-breakdown)
  - [index.html](#indexhtml)
  - [main.jsx](#mainjsx)
  - [App.jsx](#appjsx)
  - [cardConfig.js](#cardconfigjs)
  - [actions.js](#actionsjs)
  - [api.js](#apijs)
  - [index.css](#indexcss)
  - [DvcRenderer.jsx](#dvcrendererjsx)
  - [LoadingScreen.jsx](#loadingscreenjsx)
  - [ErrorScreen.jsx](#errorscreenjsx)
  - [manifest.json](#manifestjson)
  - [sw.js](#swjs)
- [Rendering Pipeline](#rendering-pipeline)
- [Coordinate System & Scaling](#coordinate-system--scaling)
- [Anchor System & Transform Origin](#anchor-system--transform-origin)
- [Form Engine](#form-engine)
- [Action System](#action-system)
- [PWA Install Flow](#pwa-install-flow)
- [Developer Debug Panel](#developer-debug-panel)
- [CSS Architecture](#css-architecture)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  index.html ──► main.jsx ──► App.jsx ──► DvcRenderer.jsx        │
│                                │              │                 │
│                          cardConfig.js    actions.js             │
│                          (screens[])     (actionMap{})           │
│                                │              │                 │
│                           api.js          index.css              │
│                        (fetch data)    (design tokens)           │
│                                                                 │
│  public/                                                        │
│  ├── manifest.json  (PWA)                                       │
│  ├── sw.js          (Service Worker)                            │
│  └── assets/images/ (all visual assets)                         │
└─────────────────────────────────────────────────────────────────┘
```

**Architecture Type:** Single Page Application (SPA) — configuration-driven, no routing library needed.

**Core Principle:** The entire card layout is defined in a single JSON-like config (`cardConfig.js`). The rendering engine (`DvcRenderer.jsx`) reads this config and converts Figma pixel coordinates into responsive CSS units. **Zero component code changes are needed to create new cards.**

---

## File Map

```
dvc-react/
│
├── index.html                 ← HTML shell, PWA manifest link, SW registration
│
├── public/
│   ├── manifest.json          ← PWA web app manifest
│   ├── sw.js                  ← Minimal service worker (PWA install support)
│   └── assets/images/         ← ALL image assets (backgrounds, buttons, icons)
│       ├── bg.jpg
│       ├── save_contact_btn.png
│       ├── fb.png, insta.png, linkedin.png, twitter.png
│       └── ... (all button/icon/decoration PNGs)
│
├── src/
│   ├── main.jsx               ← React DOM entry point (mounts <App />)
│   ├── App.jsx                ← Root component (state, data loading, routing)
│   ├── cardConfig.js          ← ⭐ Layout configuration (screens, elements)
│   ├── actions.js             ← Action handlers (phone, email, VCF, install)
│   ├── api.js                 ← Backend API integration (slug → card data)
│   ├── index.css              ← Design tokens, animations, form styles
│   │
│   └── components/
│       ├── DvcRenderer.jsx    ← ⭐ Core rendering engine (config → pixels)
│       ├── LoadingScreen.jsx  ← Loading spinner UI
│       └── ErrorScreen.jsx    ← Error fallback UI
│
├── package.json               ← Dependencies (React, Vite)
├── vite.config.js             ← Vite build configuration
└── eslint.config.js           ← Linting rules
```

---

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│              │     │              │     │                   │
│  api.js      │────►│  App.jsx     │────►│  DvcRenderer.jsx  │
│  (fetch)     │     │  (state)     │     │  (render)         │
│              │     │              │     │                   │
└──────────────┘     └──────┬───────┘     └────────┬──────────┘
                            │                      │
                     cardData (object)       cardConfig.js
                     currentPage (int)       (screens array)
                     setCurrentPage (fn)     actions.js
                                             (action handlers)
```

**Step-by-step:**

1. `App.jsx` loads card data (static or from API via `api.js`)
2. `App.jsx` manages `currentPage` state (which screen to show)
3. `App.jsx` passes `cardData`, `currentPage`, `setCurrentPage` as props to `DvcRenderer`
4. `DvcRenderer` reads `screens[]` from `cardConfig.js` to find the active screen
5. `DvcRenderer` loops through `texts[]`, `images[]`, `buttons[]`, `socials[]`, `inputs[]`
6. Each element's Figma coordinates are converted to responsive CSS units
7. User interactions (clicks) trigger `actions.js` handlers or page navigation

---

## Boot Sequence

```
1. Browser loads index.html
   ├── Registers service worker (sw.js)
   └── Loads main.jsx via <script type="module">

2. main.jsx
   └── createRoot('#root').render(<App />)

3. App.jsx (initial render)
   ├── Sets loading = true
   ├── Renders <LoadingScreen />
   └── Starts 800ms timer (simulated load)

4. App.jsx (after timer)
   ├── Sets cardData = STATIC_CARD_DATA (or API response)
   ├── Updates document.title from card data
   ├── Sets loading = false
   └── Renders <DvcRenderer cardData={...} currentPage={0} />

5. DvcRenderer.jsx
   ├── Finds screen with index === currentPage
   ├── Renders background image
   ├── Renders all elements (texts, images, buttons, socials, inputs)
   ├── Applies staggered fade-in animations
   └── Renders developer debug panel toggle
```

---

## File-by-File Breakdown

---

### `index.html`

**Path:** `/index.html`
**Purpose:** The HTML shell that boots the entire application.

**What it contains:**
- `<meta charset>` + `<meta viewport>` — Standard responsive setup
- `<link rel="manifest">` — Links to `manifest.json` for PWA support
- `<link rel="apple-touch-icon">` — iOS home screen icon
- `<meta name="theme-color">` — Browser address bar color (`#0f8dc8`)
- `<meta name="apple-mobile-web-app-capable">` — Fullscreen mode on iOS
- `<div id="root">` — React mount point
- `<script type="module" src="/src/main.jsx">` — Vite entry point
- Service worker registration script — Registers `sw.js` on page load

**Key detail:** The SW registration is in a plain `<script>` tag (not a module) so it runs even if the React bundle fails to load.

---

### `main.jsx`

**Path:** `/src/main.jsx`
**Purpose:** React DOM entry point. Mounts the `<App />` component into `#root`.

**What it does:**
```
createRoot(document.getElementById('root'))
  .render(<StrictMode><App /></StrictMode>)
```

- Imports `index.css` (all styles)
- Wraps in `StrictMode` for development warnings
- No routing library — page navigation is handled by `currentPage` state

---

### `App.jsx`

**Path:** `/src/App.jsx`
**Purpose:** Root component — manages application state and data loading.

**State variables:**
| State | Type | Purpose |
|-------|------|---------|
| `cardData` | `Object\|null` | The card owner's data (name, phone, email, socials) |
| `loading` | `Boolean` | Shows `<LoadingScreen>` while true |
| `currentPage` | `Number` | Index of the active screen (starts at `START_SCREEN`) |

**Constants:**
- `ASSETS_PATH` — Base path to image assets, built from `import.meta.env.BASE_URL`
- `STATIC_CARD_DATA` — Hardcoded demo data for development (name, designation, email, social URLs, etc.)

**Lifecycle:**
1. On mount, starts an 800ms timer to simulate loading
2. Sets `cardData` to `STATIC_CARD_DATA` (swap to `fetchCardData()` for production)
3. Builds and sets `document.title` from card data fields
4. Renders `<DvcRenderer>` with all props

**For production:** Replace the static data timer with:
```javascript
const slug = getSlug();
const data = await fetchCardData(slug);
setCardData(data);
```

---

### `cardConfig.js`

**Path:** `/src/cardConfig.js`
**Purpose:** ⭐ **The most important file.** Defines every screen, every element, and every layout coordinate.

**Exports:**

| Export | Type | Purpose |
|--------|------|---------|
| `REFERENCE_FRAME` | `Object` | `{ width: 1080, height: 1920 }` — Figma artboard size |
| `START_SCREEN` | `Number` | Which screen index to show first (default: `0`) |
| `xPct(x)` | `Function` | Converts Figma X → percentage of container width |
| `yPct(y)` | `Function` | Converts Figma Y → percentage of container height |
| `wPct(w)` | `Function` | Converts Figma width → percentage of container width |
| `hPct(h)` | `Function` | Converts Figma height → percentage of container height |
| `fontCqw(fontSize)` | `Function` | Converts Figma font size → `cqw` units |
| `sizeCqw(px)` | `Function` | Converts any Figma pixel value → `cqw` units |
| `screens` | `Array` | Array of screen objects (the full layout definition) |

**Screen object structure:**
```javascript
{
  index: 0,              // Unique screen ID
  name: 'Home',          // Human-readable name (shown in dev panel)
  background: 'bg.jpg',  // Background image filename

  texts: [...],          // Text elements array
  images: [...],         // Decorative image elements array
  buttons: [...],        // Interactive button elements array
  socials: [...],        // Social media icon elements array
  inputs: [...],         // Form input field elements array (optional)
}
```

**Helper function formulas:**
```
xPct(x)       = (x / 1080) * 100      → left position as %
yPct(y)       = (y / 1920) * 100      → top position as %
wPct(w)       = (w / 1080) * 100      → width as %
fontCqw(size) = (size / 1080) * 100   → font-size in cqw
sizeCqw(px)   = (px / 1080) * 100     → any dimension in cqw
```

**Current screens defined:**

| Index | Name | Purpose |
|-------|------|---------|
| 0 | Home | Main DVC card with contact info, buttons, socials |
| 1 | Products | Products/presentations page |
| 2 | Contact | Lead contact form with inputs |
| 3 | Success | Form submission success page |

---

### `actions.js`

**Path:** `/src/actions.js`
**Purpose:** Contains all action handler functions that buttons and text elements can trigger.

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                     actions.js                          │
│                                                         │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │ Event Listeners │   │ Action Functions             │  │
│  │                 │   │                               │ │
│  │ beforeinstall-  │   │ downloadVcf(cardData)        │  │
│  │ prompt ─► store │   │ shareCard()                  │  │
│  │                 │   │ callPhone(cardData)           │  │
│  │ appinstalled    │   │ openEmail(cardData)           │  │
│  │ ─► clear store  │   │ openMap(cardData)             │  │
│  └─────────────────┘   │ openWebsite(cardData)         │  │
│                         │ openWhatsApp(cardData)        │  │
│                         │ downloadPresentations(data)   │  │
│                         │ openFacebook(cardData)        │  │
│                         │ openLinkedIn(cardData)        │  │
│                         │ openInstagram(cardData)       │  │
│                         │ openTwitter(cardData)         │  │
│                         │ installApp()                  │  │
│                         └─────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ actionMap = { downloadVcf, shareCard, ... }         │ │
│  │ executeAction(name, cardData) ─► actionMap[name]()  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**How actions work:**
1. A button in `cardConfig.js` has `action: 'callPhone'`
2. User clicks the button → `DvcRenderer` calls `handleAction(btn)`
3. `handleAction` checks the action type:
   - `goToPage` → calls `setCurrentPage(pageIndex)` (internal navigation)
   - `submitForm` → runs validation → dispatches action → shows success overlay
   - Everything else → calls `executeAction(actionName, cardData)`
4. `executeAction` looks up the function in `actionMap` and calls it with `cardData`

**Key functions explained:**

| Function | What it does |
|----------|-------------|
| `downloadVcf` | Builds a VCF 3.0 string from card data, adds labeled URLs (Website, WhatsApp, socials), creates a data URI, triggers download |
| `shareCard` | Uses `navigator.share()` Web Share API; falls back to clipboard copy |
| `callPhone` | Opens `tel:` URL to trigger phone dialer |
| `openEmail` | Opens `mailto:` URL to trigger email client |
| `openMap` | URL-encodes address, opens Google Maps search; supports direct URL addresses |
| `installApp` | Calls stored `beforeinstallprompt` event's `.prompt()`; shows iOS instructions as fallback |

**PWA install capture:** On module load, two global event listeners are registered:
- `beforeinstallprompt` → stores the event in `deferredInstallPrompt`
- `appinstalled` → clears `deferredInstallPrompt`

---

### `api.js`

**Path:** `/src/api.js`
**Purpose:** Backend API integration for fetching real card data by URL slug.

**Exports:**

| Function | Purpose |
|----------|---------|
| `resolveSlug()` | Extracts the card slug from the current URL path (e.g. `/dvc-react/john-doe_abc123` → `john-doe_abc123`) |
| `fetchCardData(slug)` | POSTs slug to API endpoint, normalizes the response into a clean card data object |
| `getLocalTestSlug()` | Returns a hardcoded test slug for local development |
| `getSlug()` | Tries `resolveSlug()` first; falls back to `getLocalTestSlug()` on localhost |

**API flow:**
```
URL path → resolveSlug() → slug string
                ↓
         fetchCardData(slug)
                ↓
         POST /cards/kunvarji/portal/api/getIdMasterDataById
         body: FormData { slug }
                ↓
         API JSON response (raw field names)
                ↓
         Normalize → { user_name, email, mobile_number, ... }
```

**Field mapping (API → App):**

| API Field | Normalized Key |
|-----------|---------------|
| `fname` + `lname` | `user_name` |
| `designation` | `user_designation` |
| `department_name` | `department_name` |
| `mailId` | `email` |
| `mobile` | `mobile_number` |
| `mapLocation` | `address` |
| `companyName` | `company_name` |
| `weblink` | `website` |
| `facebook` | `facebook_url` |
| `instagram` | `instagram_url` |
| `linkedin` | `linkedin_url` |
| `twitter` | `x_url` |
| `qrcode` | `qr_code` |
| `presentations` | `presentations` |

**Not used in current App.jsx** — the static data object is used instead. To enable API mode, replace the static data logic in `App.jsx` with `getSlug()` + `fetchCardData()`.

---

### `index.css`

**Path:** `/src/index.css`
**Purpose:** All visual styling — design tokens, animations, form inputs, and interactive effects.

**Structure:**

```
index.css
├── @import Google Fonts (Inter)
├── @import Tailwind CSS v4
│
├── @theme { ... }              ← Design tokens (colors, font)
├── Base Reset (* box-sizing)   ← Global reset
├── html/body/#root             ← Full-screen, no-scroll, dark background
│
├── .loader-spinner             ← CSS loading animation (spin keyframe)
├── @keyframes fadeIn            ← Element entrance animation
├── @keyframes fadeInToMuted     ← Muted entrance for disabled elements
│
├── .stagger-children > *       ← Cascading delay animations (nth-child 1-30)
│
├── .btn-glow                   ← Button hover glow + scale transition
├── .form-input-premium         ← Glassmorphic input styling
├── .form-input-error           ← Red border + glow for validation errors
├── .form-select-premium        ← Custom dropdown arrow SVG
├── .form-textarea-premium      ← No-resize textarea
├── .form-checkbox-custom       ← CSS-only checkbox with checkmark ::after
├── .form-radio-custom          ← CSS-only radio with dot ::after
├── .form-file-upload-card      ← Dashed upload area with hover effect
│
├── .css-btn-premium            ← CSS text button styling
│   ├── :hover                  ← Brightness + shadow + translateY
│   └── :active                 ← Scale down press effect
│
├── .success-overlay-backdrop   ← Full-screen blur overlay
├── .success-card-pop           ← Bouncy scale-in card animation
├── .success-check-circle       ← Green circle with pop animation
└── .success-check-icon         ← Checkmark made from CSS borders
```

**Design tokens (CSS custom properties):**

| Token | Value | Used for |
|-------|-------|----------|
| `--color-card-bg` | `#01294c` | Card background |
| `--color-card-accent` | `#0f8dc8` | Primary accent (buttons, focus rings) |
| `--color-card-text` | `#ffffff` | Primary text color |
| `--color-card-muted` | `#4886B1` | Secondary/muted text |
| `--color-card-danger` | `#FA353A` | Error/validation red |
| `--font-family-base` | `'Inter'` | Base font family |

**Stagger animation system:** Each direct child of `.stagger-children` gets a progressive `animation-delay` from 0.05s to 1.5s (30 children supported). This creates the cascading fade-in effect when a screen loads.

---

### `DvcRenderer.jsx`

**Path:** `/src/components/DvcRenderer.jsx`
**Purpose:** ⭐ **The core rendering engine.** Takes the config and card data, outputs a fully responsive card.

**Props:**

| Prop | Type | Purpose |
|------|------|---------|
| `cardData` | `Object` | The card owner's data (name, email, phone, etc.) |
| `assetsPath` | `String` | Base URL path to image assets |
| `currentPage` | `Number` | Active screen index |
| `setCurrentPage` | `Function` | Callback to navigate between screens |

**Internal state:**

| State | Type | Purpose |
|-------|------|---------|
| `formData` | `Object` | `{ inputId: value }` — all form field values |
| `formErrors` | `Object` | `{ inputId: errorMessage }` — validation errors |
| `showSuccess` | `Boolean` | Controls the submission success overlay |
| `showDevPanel` | `Boolean` | Toggles developer debug panel |

**Key internal functions:**

| Function | Purpose |
|----------|---------|
| `getTransformOrigin(item)` | Computes CSS `transform-origin` from `anchorX`/`anchorY` |
| `handleInputChange(id, value)` | Updates `formData`, clears related errors |
| `handleAction(item)` | Routes button clicks → navigation, form submission, or action dispatch |
| `resolveText(txt)` | Returns `staticText` or `cardData[dataKey]` |
| `getTieredFontCqw(base, text)` | Reduces font size in tiers for long text |
| `getDynamicFontSize(txt, content)` | Auto-fit algorithm: shrinks font to fit width×height box |
| `sizeCqw(px)` | Converts Figma pixels to cqw units |
| `getAdvancedStyles(item)` | Extracts optional style props (opacity, shadow, border, etc.) |

**Render structure:**
```
<div>                               ← Dark background wrapper
  <div @container aspect-ratio:9/16> ← Card container (responsive)
    <img>                            ← Background image
    
    {showSuccess && <overlay>}       ← Success celebration modal
    
    <div .stagger-children>          ← All elements wrapper
      {images.map → <img>}          ← Decorative images
      {texts.map → <div>}           ← Text elements
      {inputs.map → <input/...>}    ← Form fields + labels + errors
      {buttons.map → <button>}      ← Clickable buttons
      {socials.map → <button>}      ← Social media icons
    </div>

    <button ⚙>                      ← Dev panel toggle
    {showDevPanel && <DevPanel>}     ← Debug overlay
  </div>
</div>
```

---

### `LoadingScreen.jsx`

**Path:** `/src/components/LoadingScreen.jsx`
**Purpose:** Full-screen loading state shown while card data is being fetched.

**What it renders:**
- Dark blue background (`#01294c`)
- CSS spinner animation (`.loader-spinner` — border spin)
- "Loading your digital card..." text
- Fade-in entrance animation

---

### `ErrorScreen.jsx`

**Path:** `/src/components/ErrorScreen.jsx`
**Purpose:** Fallback UI shown when card data cannot be loaded.

**Props:** `message` (optional string) — custom error message.

**What it renders:**
- 😕 emoji icon
- "Card Not Found" heading
- Error message text (default: "We couldn't load this digital visiting card...")
- Fade-in entrance animation

---

### `manifest.json`

**Path:** `/public/manifest.json`
**Purpose:** PWA web app manifest — tells the browser how to install the app.

**Fields:**

| Field | Value | Purpose |
|-------|-------|---------|
| `name` | "Digital Visiting Card" | Full app name |
| `short_name` | "DVC" | Shown under home screen icon |
| `display` | "standalone" | Runs without browser chrome |
| `orientation` | "portrait" | Forces portrait mode |
| `background_color` | `#01294c` | Splash screen background |
| `theme_color` | `#0f8dc8` | Status bar color |
| `start_url` | "./" | Entry point |
| `icons` | location_btn.png | Placeholder — replace with real icon |

---

### `sw.js`

**Path:** `/public/sw.js`
**Purpose:** Minimal service worker to satisfy PWA install requirements.

**Events handled:**

| Event | Behavior |
|-------|----------|
| `install` | Calls `skipWaiting()` — activates immediately |
| `activate` | Clears old caches, calls `clients.claim()` |
| `fetch` | Network-first strategy — falls back to cache on network failure |

**Why it exists:** Browsers require a registered service worker for the `beforeinstallprompt` event to fire. Without it, the "Add to Home Screen" feature won't work.

---

## Rendering Pipeline

How a single element goes from config to screen:

```
cardConfig.js                    DvcRenderer.jsx                    Browser
─────────────                    ───────────────                    ───────

{ x: 540, y: 452,         →     left: xPct(540)%               →  left: 50%
  fontSize: 60,            →     fontSize: fontCqw(60)cqw       →  fontSize: 5.55cqw
  width: 380,              →     width: sizeCqw(380)cqw         →  width: 35.18cqw
  anchorX: 0.5,            →     transform: translate(-50%, 0%) →  centered on X
  anchorY: 0,              →     transformOrigin: 50% 0%        →  pivot from top-center
  rotation: 15,            →     transform: ... rotate(15deg)   →  rotated 15°
  scale: 1.05,             →     transform: ... scale(1.05)     →  slightly enlarged
  opacity: 0.8,            →     opacity: 0.8                   →  semi-transparent
  shadow: '...',           →     boxShadow: '...'               →  drop shadow
}
```

**Unit conversions:**
```
Figma pixels → cqw (container query width units)
Formula:      cqw_value = (figma_px / 1080) * 100

Example:      540px → (540/1080)*100 = 50cqw
              60px font → (60/1080)*100 = 5.55cqw
```

**Why cqw?** The card uses `@container` queries. `cqw` units scale proportionally to the card container width, keeping everything responsive regardless of viewport size.

---

## Coordinate System & Scaling

```
┌────────────────────────┐
│ Figma Frame: 1080×1920 │
│                        │
│  (0,0) ────────► X     │
│   │                    │
│   │    (540, 452)      │
│   │       ●            │
│   ▼                    │
│   Y                    │
│                        │
│              (1080,    │
│               1920)    │
└────────────────────────┘

Conversion to CSS:
  left   = (x / 1080) * 100  → percentage
  top    = (y / 1920) * 100  → percentage
  width  = (w / 1080) * 100  → cqw units
  height = (h / 1080) * 100  → cqw units (note: also uses width as base!)
  font   = (f / 1080) * 100  → cqw units
```

**Important:** Both width AND height use `1080` (container width) as the divisor when converted to `cqw`. This is because `cqw` is always relative to container width, not height.

---

## Anchor System & Transform Origin

The anchor system controls where an element's origin point sits:

```
anchorX=0, anchorY=0          anchorX=0.5, anchorY=0         anchorX=1, anchorY=0
┌──────────┐                      ┌──────────┐                    ┌──────────┐
● ─ ─ ─ ─ │                  ─ ─ ● ─ ─ ─ ─ │               ─ ─ ─ ─ ─ ─ ─ ─●
│          │                      │          │                    │          │
│  element │                      │  element │                    │  element │
│          │                      │          │                    │          │
└──────────┘                      └──────────┘                    └──────────┘

anchorX=0, anchorY=0.5        anchorX=0.5, anchorY=0.5       anchorX=0, anchorY=1
┌──────────┐                      ┌──────────┐                    ┌──────────┐
│          │                      │          │                    │          │
● ─ ─ ─ ─ │                  ─ ─ ● ─ ─ ─ ─ │                    │  element │
│          │                      │ (center) │                    │          │
│  element │                      │          │                    ● ─ ─ ─ ─ │
└──────────┘                      └──────────┘                    └──────────┘
```

**CSS implementation:**
```javascript
// Position: element placed at (x, y) then shifted back by anchor amount
transform: translate(-(anchorX * 100)%, -(anchorY * 100)%)

// Pivot: rotation and scale happen around the anchor point
transformOrigin: (anchorX * 100)% (anchorY * 100)%
```

**Why both?** Without matching `transformOrigin`, a rotated element with `anchorX: 0.5` would rotate around its CSS default center (50% 50%), which is correct. But an element with `anchorX: 0, anchorY: 1` would still rotate around center instead of bottom-left — causing misalignment.

---

## Form Engine

The form system runs entirely inside `DvcRenderer.jsx` with no external form library.

```
User types → handleInputChange() → formData state updates
                                       ↓
User clicks Submit → handleAction({ action: 'submitForm' })
                                       ↓
                              Validation Loop
                     ┌─────────────────────────────┐
                     │ For each input in screen:    │
                     │  1. required? check empty    │
                     │  2. email? check regex       │
                     │  3. pattern? check regex     │
                     │  4. minLength? check length  │
                     │  5. checkbox? check truthy   │
                     └─────────────────────────────┘
                                       ↓
                          errors found? ──► setFormErrors → show inline errors
                          no errors?    ──► show success overlay
                                           ──► dispatch submitAction
                                           ──► clear form
                                           ──► setTimeout → navigate to successPageIndex
```

**Input type rendering:**

| Type | HTML Element | Special Features |
|------|-------------|-----------------|
| `text`, `email`, `tel` | `<input>` | Clear (×) button overlay |
| `textarea` | `<textarea>` | No-resize, scrollable |
| `select` | `<select>` | Custom SVG arrow, styled options |
| `checkbox` | Custom `<div>` or `<img>` | CSS checkmark or custom asset images |
| `radio` | Custom `<div>` or `<img>` | Row/column layout, CSS dot or custom assets |
| `image`/`file` | Hidden `<input type="file">` | FileReader → base64 preview, clear button |

---

## Action System

```
Button Click
     │
     ▼
handleAction(item)
     │
     ├── item.action === 'goToPage'
     │   └── setCurrentPage(item.pageIndex)
     │
     ├── item.action === 'submitForm'
     │   ├── Validate all inputs on current screen
     │   ├── If errors → setFormErrors(errors) → STOP
     │   └── If valid → showSuccess → executeAction(submitAction) → redirect
     │
     └── any other action
         └── executeAction(item.action, cardData)
                  │
                  ▼
              actionMap[actionName](cardData)
                  │
                  ├── downloadVcf → build VCF string → download file
                  ├── callPhone → window.open('tel:...')
                  ├── openEmail → window.open('mailto:...')
                  ├── shareCard → navigator.share() or clipboard
                  ├── installApp → deferredPrompt.prompt()
                  └── ... etc
```

---

## PWA Install Flow

```
Page Load
    │
    ├── index.html registers sw.js
    │
    ├── Browser checks PWA criteria:
    │   ✓ Has manifest.json
    │   ✓ Has registered service worker
    │   ✓ Served over HTTPS (or localhost)
    │
    ├── Browser fires 'beforeinstallprompt' event
    │   └── actions.js captures it → deferredInstallPrompt = event
    │
    ▼
User clicks "Install App" button (action: 'installApp')
    │
    ├── deferredInstallPrompt exists?
    │   ├── YES → .prompt() → native browser install dialog
    │   └── NO  → Check platform:
    │       ├── Already standalone → "Already installed!"
    │       ├── iOS Safari → Show manual instructions
    │       └── Other → Show browser menu instructions
    │
    ▼
User accepts install
    │
    └── Browser fires 'appinstalled' → deferredInstallPrompt = null
```

---

## Developer Debug Panel

```
┌──────────────────────────────────┐
│ 🛠 Developer Debug Panel         │
│──────────────────────────────────│
│ Screen: Home (index: 0)         │
│──────────────────────────────────│
│ 📄 Navigate (goToPage)          │
│ [0: Home] [1: Products]         │
│ [2: Contact] [3: Success]       │
│──────────────────────────────────│
│ 📊 Current Screen Elements      │
│ Texts: 6 | Images: 2            │
│ Buttons: 7 | Socials: 4         │
│ Inputs: 0                       │
│──────────────────────────────────│
│ 📝 Live Form State              │
│ { "client_name": "John",        │
│   "client_email": "j@test.com"} │
│──────────────────────────────────│
│ ⚠️ Validation Errors             │
│ { "client_phone": "Required" }  │
│──────────────────────────────────│
│ 💾 Card Data (API)              │
│ { "user_name": "Pradeep...",    │
│   "email": "pradeep@..." }      │
└──────────────────────────────────┘
                    [⚙]  ← Toggle button (bottom-left)
```

**Sections shown conditionally:**
- **Live Form State** — Only on screens with `inputs[]`
- **Validation Errors** — Only when errors exist
- **Card Data** — Always visible

**For production:** Remove or wrap in `import.meta.env.DEV` check.

---

## CSS Architecture

```
Styling Layers (top to bottom):

1. Google Fonts (@import)         ← 'Inter' font family
2. Tailwind CSS v4 (@import)      ← Utility classes (flex, absolute, etc.)
3. @theme { }                     ← Custom CSS variables (design tokens)
4. Base Reset                     ← *, html, body global styles
5. Component Styles               ← .loader-spinner, .btn-glow, .form-*
6. Animations (@keyframes)        ← fadeIn, spin, overlayFadeIn, cardPopIn
7. Stagger System (.stagger-*)    ← nth-child animation delays

Responsive Strategy:
┌─────────────────────────────────────────────┐
│ @container queries + cqw units              │
│                                             │
│ The card has:                               │
│   aspect-ratio: 9/16                        │
│   max-height: 100vh                         │
│   max-width: calc(100vh * 9/16)             │
│                                             │
│ All child elements use cqw units:           │
│   font-size: Xcqw   (scales with width)     │
│   width: Xcqw        (scales with width)    │
│   positioning: %     (scales with both)     │
│                                             │
│ Result: Card fits ANY screen perfectly      │
│ while maintaining exact Figma proportions   │
└─────────────────────────────────────────────┘
```
