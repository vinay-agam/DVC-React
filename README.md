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

## 🛠 Pro Tips
- **Overlapping Elements?** Elements render in the exact order they are listed in the config. If a button is under an image, move the button lower down in the array.
- **Center Alignment:** If you want an element perfectly centered horizontally, set `x: 540` and `anchorX: 0.5`.
- **API Data Override:** If you want an image to fallback to a placeholder if the API doesn't provide one, use:
  ```javascript
  dataKey: 'qr_code', 
  fallbackImage: 'qr_placeholder.png'
  ```
