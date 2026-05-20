# Digital Visiting Card (DVC) - React SPA

A modern, highly responsive, configuration-driven React application for Digital Visiting Cards. It uses a "Figma-to-Code" workflow where you can build completely new card layouts simply by updating a configuration file.

---

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.
3. **Build for Production:**
   ```bash
   npm run build
   ```
   This generates the compiled files in the `dist/` folder.

---

## 📂 File Structure & Important Files

```text
dvc-react/
├── public/
│   └── assets/images/         ← Place ALL your image assets here (backgrounds, buttons, icons)
├── src/
│   ├── components/
│   │   ├── DvcRenderer.jsx    ← The core layout engine (auto-scales elements using cqw)
│   │   ├── LoadingScreen.jsx  ← Loading spinner component
│   │   └── ErrorScreen.jsx    ← Fallback UI for errors
│   ├── cardConfig.js          ← ⭐️ THE MOST IMPORTANT FILE: Define all pages, texts, and buttons here
│   ├── actions.js             ← Defines what buttons do (e.g., downloadVcf, callPhone)
│   ├── api.js                 ← API integration for fetching dynamic card data
│   ├── App.jsx                ← Root logic (State management, API calls)
│   ├── main.jsx               ← React entry point
│   └── index.css              ← Tailwind CSS v4 & custom design tokens
└── package.json
```

---

## 🎨 Figma-to-Code Workflow

This app is designed to map exactly to your Figma files.

1. **Figma Setup:** Always use a frame size of **1080 x 1920**.
2. **Export Assets:** Export backgrounds, buttons, and icons as `.png` or `.jpg` to `public/assets/images/`.
3. **Copy Coordinates:** Select a layer in Figma. Look at the Properties panel (X, Y, Width).
4. **Paste in Config:** Paste those exact numbers into `src/cardConfig.js`. The engine automatically handles all responsive scaling!

---

## 📝 How to Edit `cardConfig.js`

### 1. How to Add a New Page
Pages are called `screens` in the configuration. To add a new page, append a new object to the `screens` array in `cardConfig.js`.

```javascript
export const screens = [
  // ... existing screens (index: 0, index: 1) ...
  
  {
    index: 2,                     // Unique page number
    name: 'Gallery Page',         // Internal name
    background: 'bg_gallery.jpg', // Background image from public/assets/images/
    texts: [],
    buttons: [],
    images: [],
    socials: []
  }
];
```

### 2. How to Add Image Assets (Buttons, Logos, Decorations)
Images and buttons use the X, Y, and Width from Figma.

**To add a static image (like a logo):**
Put it in the `images` array.
```javascript
{
  id: 'company_logo',
  image: 'logo.png', // Must exist in public/assets/images/
  x: 540, 
  y: 200, 
  width: 300,
  anchorX: 0.5,      // 0.5 centers it horizontally based on X. 0 aligns left.
  anchorY: 0.5       // 0.5 centers it vertically based on Y. 0 aligns top.
}
```

### 3. How to Add Text
Put it in the `texts` array. Text can be static or dynamic (loaded from the API).

**Static Text:**
```javascript
{
  id: 'welcome_text',
  staticText: 'Welcome to our Company',
  x: 540, 
  y: 300,
  fontSize: 40,      // Exact font size from Figma
  color: '#FFFFFF',  // Hex color
  align: 'center',
  anchorX: 0.5,      // 0.5 for centered text, 0 for left-aligned
  fontWeight: 600
}
```

**Dynamic Text (API Data):**
```javascript
{
  id: 'user_name',
  dataKey: 'user_name', // Matches a key from the API response (e.g., user_designation, email)
  x: 540, 
  y: 400,
  fontSize: 65,
  color: '#FFFFFF',
  align: 'center',
  anchorX: 0.5,
  fontWeight: 700
}
```

**Dynamic Multi-line Text with autoFit (e.g. Address):**
```javascript
{
  id: 'address',
  dataKey: 'address',
  x: 164, 
  y: 1375,
  width: 750,       // Figma coordinates width limit (Enables auto word-wrapping)
  height: 90,       // Figma coordinates height limit
  fontSize: 30,     // Base designer font size
  color: '#4886B1',
  align: 'left',
  anchorX: 0,
  fontWeight: 400,
  autoFit: true     // Automatically shrinks font size to fit inside 750x90px box
}
```

### 4. How to Add Buttons and Actions
Put them in the `buttons` array.

```javascript
{
  id: 'save_contact_btn',
  image: 'save_contact_btn.png',
  x: 126, 
  y: 678, 
  width: 400,
  anchorX: 0, 
  anchorY: 0,
  action: 'downloadVcf', // The action to trigger when clicked
}
```

### 5. Available Actions (Features)
Here are the built-in actions you can assign to any button or text element using the `action` property:

**Navigation:**
- `goToPage` — Moves to another screen. You MUST provide a `pageIndex` property.
  ```javascript
  { action: 'goToPage', pageIndex: 1 } // Go to Products page
  { action: 'goToPage', pageIndex: 0 } // Go Back to Home
  ```

**Native Features:**
- `downloadVcf` — Generates and downloads the contact `.vcf` file.
- `shareCard` — Opens the native Web Share UI on mobile devices.
- `callPhone` — Opens the phone dialer.
- `openEmail` — Opens the default email app.
- `openMap` — Opens Google Maps to the user's address.
- `openWebsite` — Opens the company website in a new tab.
- `openWhatsApp` — Opens WhatsApp chat.
- `downloadPresentations` — Opens the presentation link.

**Social Media:**
- `openFacebook`
- `openLinkedIn`
- `openInstagram`
- `openTwitter`

*(Note: Actions are defined in `src/actions.js`)*

---

## 🎨 Advanced Styling & Interactivity Properties

Any element configuration (text, image, button, social icon) in `cardConfig.js` can accept these optional, advanced properties to achieve high-end design styling and custom transitions.

### 🌟 Common Properties (All Elements)
| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `rotation` | `Number` | Rotates the element (in degrees). | `rotation: -10` |
| `scale` | `Number` | Adjusts the base scaling size of the element. | `scale: 1.05` |
| `opacity` | `Number` | Set transparency factor (from `0` to `1`). | `opacity: 0.8` |
| `zIndex` | `Number` | Overrides the element layering order. | `zIndex: 50` |
| `borderRadius` | `String` | Rounded corners for elements or element containers. | `borderRadius: '16px'` |
| `shadow` | `String` | Adds standard or custom CSS drop shadow. | `shadow: '0 8px 32px rgba(0,0,0,0.35)'` |
| `border` | `String` | Adds a custom CSS border around the element. | `border: '2px solid #0f8dc8'` |
| `backgroundColor` | `String` | Solid or semi-transparent background color. | `backgroundColor: '#00000050'` |
| `padding` | `String` | CSS padding space inside the element container. | `padding: '10px 20px'` |
| `filter` | `String` | Image/backdrop effects (e.g. brightness, blur). | `filter: 'brightness(1.1)'` |
| `objectFit` | `String` | Resizing fit for images (`cover`, `contain`, `fill`). | `objectFit: 'cover'` |

### 🖱️ Interactive Properties (Buttons & Socials)
These control the springy interaction animations when hovering or tapping buttons:
* `hoverScale` — Scale factor on mouse hover (e.g. `1.15`, defaults to `1.04`).
* `activeScale` — Scale factor on mouse press click (e.g. `0.92`, defaults to `0.97`).

### 🔤 Typographical Specials (Texts Only)
Allows custom styling of typographic elements to match premium typography layout:
* `width` — Bounding box width in Figma pixels. **Enables automatic word wrapping** (line breaks) when specified.
* `height` — Bounding box height limit in Figma pixels (used for height restrictions & auto-scaling).
* `align` — Text horizontal alignment override (`"left"`, `"center"`, `"right"`).
* `autoFit` — Boolean. If `true`, **dynamically shrinks the font size** to fit perfectly inside the designated `width` and `height` boundary box based on word/character volume.
* `fontFamily` — Typography family name override (e.g. `"'Outfit', sans-serif"`).
* `letterSpacing` — Character spacing tracking (e.g. `"-0.02em"` or `"0.05em"`).
* `whiteSpace` — Control text wrapping rules (`"nowrap"`, `"normal"`, `"pre-line"`).
* `lineHeight` — Adjust vertical height multiplier (e.g. `1.4`).
* `textTransform` — Text case converter (`"uppercase"`, `"capitalize"`, `"lowercase"`).
* `fontStyle` — Apply slanted posture style (`"italic"`).

---

## 🛠 Pro Tips
- **Overlapping Elements?** Elements render in the exact order they are listed in the config. If a button is under an image, move the button lower down in the array.
- **Center Alignment:** If you want an element perfectly centered horizontally, set `x: 540` and `anchorX: 0.5`.
- **API Data Override:** If you want an image to fallback to a placeholder if the API doesn't provide one, use:
  ```javascript
  dataKey: 'qr_code', 
  fallbackImage: 'qr_placeholder.png'
  ```
