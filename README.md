# Digital Visiting Card (DVC) - React SPA

A modern, highly responsive, configuration-driven React application for Digital Visiting Cards. It uses a **"Figma-to-Code"** workflow where you can build completely new card layouts simply by updating a configuration file — no component code changes needed.

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

## 📝 How to Create a DVC — Step-by-Step

### Step 1: Create a New Screen (Page)

Pages are called `screens` in the configuration. To add a new page, append a new object to the `screens` array in `cardConfig.js`.

```javascript
export const screens = [
  // ... existing screens (index: 0, index: 1) ...
  
  {
    index: 2,                     // Unique page number
    name: 'Gallery Page',         // Internal name (shown in developer panel)
    background: 'bg_gallery.jpg', // Background image from public/assets/images/
    texts: [],                    // Text elements array
    buttons: [],                  // Button elements array
    images: [],                   // Image elements array
    socials: [],                  // Social media icon array
    inputs: [],                   // Form input fields array (optional)
  }
];
```

---

### Step 2: Add Text Elements

Add text objects to the `texts[]` array. Text can be **static** (hardcoded) or **dynamic** (loaded from API data).

#### Static Text
```javascript
{
  id: 'welcome_text',            // Unique identifier
  staticText: 'Welcome!',       // Hardcoded text content
  x: 540, y: 300,               // Figma X, Y position
  fontSize: 40,                 // Font size in Figma pixels
  color: '#FFFFFF',             // Hex color
  align: 'center',              // Text alignment
  anchorX: 0.5,                 // 0.5 = centered, 0 = left-aligned
  fontWeight: 600,              // CSS font weight
}
```

#### Dynamic Text (from API/Card Data)
```javascript
{
  id: 'user_name',
  dataKey: 'user_name',         // Maps to cardData['user_name']
  x: 540, y: 400,
  fontSize: 65,
  color: '#FFFFFF',
  align: 'center',
  anchorX: 0.5,
  fontWeight: 700,
}
```

#### Multi-line Text with Auto Word Wrap
```javascript
{
  id: 'address',
  dataKey: 'address',
  x: 164, y: 1375,
  width: 750,                   // Enables auto word wrapping at this width
  height: 90,                   // Height bounding box limit
  fontSize: 30,
  color: '#4886B1',
  align: 'left',
  anchorX: 0,
  fontWeight: 400,
  autoFit: true,                // Auto-shrink font to fit in width × height box
}
```

#### Clickable Text (with action)
```javascript
{
  id: 'phone_number',
  dataKey: 'mobile_number',
  x: 164, y: 1128,
  fontSize: 46,
  color: '#FFFFFF',
  align: 'left',
  anchorX: 0,
  action: 'callPhone',          // Triggers phone dialer on click
}
```

##### 📋 All Text Properties

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | ✅ | — | Unique element identifier |
| `staticText` | `String` | ❌ | — | Hardcoded text content (use this OR `dataKey`) |
| `dataKey` | `String` | ❌ | — | Key from API/card data (use this OR `staticText`) |
| `x` | `Number` | ✅ | — | Figma X position (0–1080) |
| `y` | `Number` | ✅ | — | Figma Y position (0–1920) |
| `fontSize` | `Number` | ✅ | — | Font size in Figma pixels |
| `color` | `String` | ✅ | — | CSS color value (hex, rgb, etc.) |
| `align` | `String` | ❌ | `'left'` | Text alignment: `'left'`, `'center'`, `'right'` |
| `anchorX` | `Number` | ❌ | `0` | Horizontal anchor: `0.5` = centered on X, `0` = left |
| `fontWeight` | `Number` | ❌ | `400` | CSS font weight (100–900) |
| `fontFamily` | `String` | ❌ | `'Inter'` | CSS font family (e.g. `"'Outfit', sans-serif"`) |
| `letterSpacing` | `String` | ❌ | `'-0.01em'` | Character spacing (e.g. `'0.05em'`, `'-0.02em'`) |
| `lineHeight` | `Number` | ❌ | — | Line height multiplier (e.g. `1.4`) |
| `textTransform` | `String` | ❌ | — | `'uppercase'`, `'lowercase'`, `'capitalize'` |
| `fontStyle` | `String` | ❌ | — | `'italic'` or `'normal'` |
| `whiteSpace` | `String` | ❌ | auto | `'nowrap'`, `'normal'`, `'pre-line'` |
| `width` | `Number` | ❌ | — | Bounding box width (Figma px). Enables word wrapping |
| `height` | `Number` | ❌ | — | Bounding box height limit (Figma px) |
| `autoFit` | `Boolean` | ❌ | `false` | Auto-shrink font to fit inside `width` × `height` |
| `overflow` | `String` | ❌ | `'hidden'` | CSS overflow behavior |
| `textOverflow` | `String` | ❌ | auto | `'ellipsis'` or `'clip'` |
| `action` | `String` | ❌ | — | Action to trigger on click (see Available Actions) |
| `rotation` | `Number` | ❌ | `0` | Rotation in degrees |
| `scale` | `Number` | ❌ | `1` | Scale factor |
| `opacity` | `Number` | ❌ | `1` | Transparency (0–1) |
| `zIndex` | `Number` | ❌ | — | CSS z-index layering |
| `borderRadius` | `String` | ❌ | — | Rounded corners (e.g. `'12px'`) |
| `shadow` | `String` | ❌ | — | CSS box-shadow |
| `border` | `String` | ❌ | — | CSS border (e.g. `'2px solid #0f8dc8'`) |
| `backgroundColor` | `String` | ❌ | — | Background color |
| `padding` | `String` | ❌ | — | CSS padding |
| `filter` | `String` | ❌ | — | CSS filter (e.g. `'blur(2px)'`) |

---

### Step 3: Add Image Elements

Add image objects to the `images[]` array for logos, decorations, QR codes, etc.

#### Static Image
```javascript
{
  id: 'company_logo',
  image: 'logo.png',            // File in public/assets/images/
  x: 540, y: 200,
  width: 300,
  anchorX: 0.5,                 // 0.5 centers horizontally on X
  anchorY: 0.5,                 // 0.5 centers vertically on Y
}
```

#### Dynamic Image (from API with fallback)
```javascript
{
  id: 'qr_code',
  dataKey: 'qr_code',           // Uses cardData['qr_code'] if available
  fallbackImage: 'qr_placeholder.png', // Fallback if API value is null
  x: 700, y: 1020,
  width: 236, height: 236,
  anchorX: 0, anchorY: 0,
  borderRadius: '16px',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
}
```

##### 📋 All Image Properties

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | ✅ | — | Unique element identifier |
| `image` | `String` | ❌ | — | Static image filename from `public/assets/images/` |
| `dataKey` | `String` | ❌ | — | API data key to get dynamic image URL |
| `fallbackImage` | `String` | ❌ | — | Fallback image if `dataKey` value is null |
| `x` | `Number` | ✅ | — | Figma X position (0–1080) |
| `y` | `Number` | ✅ | — | Figma Y position (0–1920) |
| `width` | `Number` | ❌ | — | Width in Figma pixels |
| `height` | `Number` | ❌ | — | Height in Figma pixels |
| `anchorX` | `Number` | ❌ | `0` | Horizontal anchor: `0` = left, `0.5` = center, `1` = right |
| `anchorY` | `Number` | ❌ | `0` | Vertical anchor: `0` = top, `0.5` = center, `1` = bottom |
| `rotation` | `Number` | ❌ | `0` | Rotation in degrees |
| `scale` | `Number` | ❌ | `1` | Scale factor |
| `opacity` | `Number` | ❌ | `1` | Transparency (0–1) |
| `zIndex` | `Number` | ❌ | — | CSS z-index layering |
| `borderRadius` | `String` | ❌ | — | Rounded corners (e.g. `'16px'`, `'50%'`) |
| `shadow` | `String` | ❌ | — | CSS box-shadow |
| `border` | `String` | ❌ | — | CSS border |
| `backgroundColor` | `String` | ❌ | — | Background color |
| `padding` | `String` | ❌ | — | CSS padding |
| `filter` | `String` | ❌ | — | CSS filter (e.g. `'brightness(1.1)'`, `'blur(2px)'`) |
| `objectFit` | `String` | ❌ | — | Image resize fit: `'cover'`, `'contain'`, `'fill'` |

> **Anchor System Explained:**
> The `anchorX` and `anchorY` values control the pivot point for positioning and transforms.
> - `anchorX: 0, anchorY: 0` → Top-left corner placed at (x, y)
> - `anchorX: 0.5, anchorY: 0.5` → Center placed at (x, y)
> - `anchorX: 1, anchorY: 1` → Bottom-right corner placed at (x, y)
> - When `rotation` or `scale` is applied, the element pivots around the anchor point (not center)

---

### Step 4: Add Buttons

Add button objects to the `buttons[]` array. Buttons can use **image assets** or be **CSS-only styled text buttons**.

#### Image Button
```javascript
{
  id: 'save_contact_btn',
  image: 'save_contact_btn.png', // Image file
  x: 126, y: 678,
  width: 400,
  anchorX: 0, anchorY: 0,
  action: 'downloadVcf',        // Action triggered on click
  hoverScale: 1.06,             // Scale on hover
  activeScale: 0.95,            // Scale on click
}
```

#### CSS Text Button (No Image Needed)
```javascript
{
  id: 'submit_btn',
  label: 'Submit Request',       // Text displayed on the button
  x: 540, y: 1720,
  width: 880, height: 95,
  anchorX: 0.5, anchorY: 0.5,
  action: 'submitForm',         // Triggers form validation + submission
  successPageIndex: 3,          // Navigate here after successful submit
  backgroundColor: '#0f8dc8',
  color: '#ffffff',
  borderRadius: '16px',
  fontSize: 34,
  hoverScale: 1.05,
  activeScale: 0.95,
}
```

#### Navigation Button (goToPage)
```javascript
{
  id: 'products_btn',
  image: 'products_btn.png',
  x: 41, y: 1696, width: 480,
  anchorX: 0, anchorY: 0,
  action: 'goToPage',           // Navigate to another screen
  pageIndex: 2,                 // Target screen index
}
```

##### 📋 All Button Properties

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | ✅ | — | Unique element identifier |
| `image` | `String` | ❌ | — | Image filename (omit for CSS text button) |
| `label` | `String` | ❌ | `'Button'` | Text for CSS-only buttons (ignored if `image` is set) |
| `x` | `Number` | ✅ | — | Figma X position (0–1080) |
| `y` | `Number` | ✅ | — | Figma Y position (0–1920) |
| `width` | `Number` | ❌ | `380` | Width in Figma pixels |
| `height` | `Number` | ❌ | `90` | Height in Figma pixels (CSS buttons only) |
| `anchorX` | `Number` | ❌ | `0` | Horizontal anchor point |
| `anchorY` | `Number` | ❌ | `0` | Vertical anchor point |
| `action` | `String` | ✅ | — | Action name to trigger (see Available Actions) |
| `pageIndex` | `Number` | ❌ | — | Target page for `goToPage` action |
| `successPageIndex` | `Number` | ❌ | — | Redirect page after `submitForm` succeeds |
| `submitAction` | `String` | ❌ | — | Custom action name dispatched with form data on submit |
| `fontSize` | `Number` | ❌ | `32` | Font size for CSS text buttons |
| `color` | `String` | ❌ | `'#ffffff'` | Text color for CSS text buttons |
| `backgroundColor` | `String` | ❌ | accent | Background color for CSS text buttons |
| `borderRadius` | `String` | ❌ | `12px` | Rounded corners |
| `shadow` | `String` | ❌ | auto | CSS box-shadow |
| `border` | `String` | ❌ | `'none'` | CSS border |
| `padding` | `String` | ❌ | `'0 16px'` | CSS padding |
| `rotation` | `Number` | ❌ | `0` | Rotation in degrees |
| `scale` | `Number` | ❌ | `1` | Scale factor |
| `opacity` | `Number` | ❌ | `1` | Transparency (0–1) |
| `zIndex` | `Number` | ❌ | — | CSS z-index layering |
| `hoverScale` | `Number` | ❌ | `1.04` | Scale on mouse hover |
| `activeScale` | `Number` | ❌ | `0.97` | Scale on mouse click |
| `filter` | `String` | ❌ | — | CSS filter |

---

### Step 5: Add Social Media Icons

Add social icon objects to the `socials[]` array. These are image buttons that link to social media profiles.

```javascript
{
  id: 'fb',
  image: 'fb.png',              // Icon image file
  x: 178, y: 1498,
  width: 80,                    // Icon size
  action: 'openFacebook',       // Social action
  hoverScale: 1.15,
  activeScale: 0.90,
}
```

> **Auto-dim feature:** Social icons automatically appear dimmed (30% opacity) and disabled if the corresponding data key is not present in `cardData`. For example, `openFacebook` checks `cardData.facebook_url`.

##### 📋 All Social Properties

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | ✅ | — | Unique element identifier |
| `image` | `String` | ✅ | — | Icon image filename |
| `x` | `Number` | ✅ | — | Figma X position |
| `y` | `Number` | ✅ | — | Figma Y position |
| `width` | `Number` | ❌ | `140` | Icon width in Figma pixels |
| `action` | `String` | ✅ | — | Social action name |
| `rotation` | `Number` | ❌ | `0` | Rotation in degrees |
| `scale` | `Number` | ❌ | `1` | Scale factor |
| `opacity` | `Number` | ❌ | `1` | Transparency |
| `zIndex` | `Number` | ❌ | — | CSS z-index |
| `borderRadius` | `String` | ❌ | — | Rounded corners |
| `hoverScale` | `Number` | ❌ | `1.04` | Scale on hover |
| `activeScale` | `Number` | ❌ | `0.97` | Scale on click |
| `shadow` | `String` | ❌ | — | CSS box-shadow |
| `border` | `String` | ❌ | — | CSS border |
| `filter` | `String` | ❌ | — | CSS filter |

##### Social Action ↔ Data Key Mapping

| Action | Required `cardData` Key |
| :--- | :--- |
| `openFacebook` | `facebook_url` |
| `openLinkedIn` | `linkedin_url` |
| `openInstagram` | `instagram_url` |
| `openTwitter` | `x_url` |

---

### Step 6: Add Form Inputs

Add input objects to the `inputs[]` array on any screen. All input types are **fully optional** — only use the ones you need!

#### Text Input
```javascript
{
  id: 'client_name',
  type: 'text',
  label: 'Full Name',
  placeholder: 'Enter your full name',
  required: true,
  x: 540, y: 360, width: 880, height: 90,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 32,
}
```

#### Email Input (with auto email validation)
```javascript
{
  id: 'client_email',
  type: 'email',
  label: 'Email Address',
  placeholder: 'name@company.com',
  required: true,
  x: 540, y: 530, width: 880, height: 90,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 32,
}
```

#### Phone Input (with regex pattern validation)
```javascript
{
  id: 'client_phone',
  type: 'tel',
  label: 'Phone Number',
  placeholder: 'e.g. +91 98765 43210',
  required: true,
  pattern: '^\\+?\\d{9,15}$',
  patternMessage: 'Please enter a valid phone number',
  x: 540, y: 700, width: 880, height: 90,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 32,
}
```

#### Textarea
```javascript
{
  id: 'client_message',
  type: 'textarea',
  label: 'Your Message',
  placeholder: 'Describe your requirements...',
  required: true,
  minLength: 10,
  x: 540, y: 1315, width: 880, height: 190,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 32,
}
```

#### Select Dropdown
```javascript
{
  id: 'client_interest',
  type: 'select',
  label: 'Department',
  placeholder: 'Choose a department',
  options: ['Wealth Management', 'Financial Advisory', 'General Enquiry'],
  required: true,
  x: 540, y: 870, width: 880, height: 90,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 32,
}
```

#### Checkbox
```javascript
{
  id: 'client_agree',
  type: 'checkbox',
  checkboxLabel: 'I accept terms & privacy policy',
  required: true,
  x: 100, y: 1495, width: 880, height: 60,
  anchorX: 0, anchorY: 0.5,
  fontSize: 28,
  checkboxSize: 45,
}
```

#### Checkbox with Custom Asset Images
```javascript
{
  id: 'client_agree',
  type: 'checkbox',
  checkboxLabel: 'I agree to terms',
  required: true,
  x: 100, y: 1495, width: 880, height: 60,
  anchorX: 0, anchorY: 0.5,
  checkedImage: 'checkbox_on.png',     // Custom checked state image
  uncheckedImage: 'checkbox_off.png',  // Custom unchecked state image
  checkboxSize: 50,
}
```

#### Radio Group
```javascript
{
  id: 'contact_method',
  type: 'radio',
  label: 'Preferred Contact',
  options: ['Phone', 'Email', 'WhatsApp'],
  direction: 'row',             // 'row' = horizontal, 'column' = vertical
  required: true,
  x: 100, y: 1200, width: 880, height: 60,
  anchorX: 0, anchorY: 0.5,
  fontSize: 28,
  radioSize: 50,
}
```

#### Radio Group with Custom Asset Images
```javascript
{
  id: 'contact_method',
  type: 'radio',
  options: ['Phone', 'Email', 'WhatsApp'],
  direction: 'column',
  x: 100, y: 1200, width: 880, height: 200,
  anchorX: 0, anchorY: 0,
  checkedImage: 'radio_selected.png',
  uncheckedImage: 'radio_unselected.png',
  radioSize: 45,
  fontSize: 26,
}
```

#### Image / File Upload
```javascript
{
  id: 'client_logo',
  type: 'image',                // or 'file'
  label: 'Upload Business Logo',
  placeholder: 'Tap to select an image',
  accept: 'image/*',            // File type filter
  x: 540, y: 1060, width: 880, height: 160,
  anchorX: 0.5, anchorY: 0.5,
  fontSize: 28,
  borderRadius: '16px',
}
```

##### 📋 All Input Properties

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | ✅ | — | Unique input field identifier (used as form data key) |
| `type` | `String` | ✅ | — | `'text'`, `'email'`, `'tel'`, `'textarea'`, `'select'`, `'checkbox'`, `'radio'`, `'image'`, `'file'` |
| `label` | `String` | ❌ | — | Floating label above the field |
| `placeholder` | `String` | ❌ | — | Placeholder text inside the field |
| `x` | `Number` | ✅ | — | Figma X position |
| `y` | `Number` | ✅ | — | Figma Y position |
| `width` | `Number` | ❌ | `800` | Field width in Figma pixels |
| `height` | `Number` | ❌ | `90` | Field height in Figma pixels |
| `anchorX` | `Number` | ❌ | `0` | Horizontal anchor |
| `anchorY` | `Number` | ❌ | `0` | Vertical anchor |
| `fontSize` | `Number` | ❌ | `32` | Input text font size in Figma pixels |
| `borderRadius` | `String/Number` | ❌ | auto | Field rounded corners |
| `rotation` | `Number` | ❌ | `0` | Rotation in degrees |
| `scale` | `Number` | ❌ | `1` | Scale factor |
| `color` | `String` | ❌ | `rgba(255,255,255,0.75)` | Label/text color (for checkbox/radio labels) |
| `zIndex` | `Number` | ❌ | `5` | CSS z-index |
| `opacity` | `Number` | ❌ | `1` | Transparency |

**Validation Properties:**

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `required` | `Boolean` | ❌ | `false` | Field must have a value to submit |
| `minLength` | `Number` | ❌ | — | Minimum character count |
| `pattern` | `String` | ❌ | — | Regex pattern for validation (e.g. `'^\\+?\\d{10,15}$'`) |
| `patternMessage` | `String` | ❌ | `'Invalid format'` | Custom error message when pattern fails |

**Select & Radio Properties:**

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `options` | `Array` | ✅* | — | Array of choice strings (required for `select` and `radio`) |
| `direction` | `String` | ❌ | `'row'` | Radio layout: `'row'` (horizontal) or `'column'` (vertical) |

**Checkbox & Radio Custom Assets:**

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `checkedImage` | `String` | ❌ | — | Custom asset filename for checked/selected state |
| `uncheckedImage` | `String` | ❌ | — | Custom asset filename for unchecked/unselected state |
| `checkboxSize` | `Number` | ❌ | `50` | Checkbox box size in Figma pixels |
| `radioSize` | `Number` | ❌ | `50` | Radio circle size in Figma pixels |
| `checkboxLabel` | `String` | ❌ | — | Text shown beside checkbox |

**File Upload Properties:**

| Property | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `accept` | `String` | ❌ | `'image/*'` | File type filter (e.g. `'image/*'`, `'.pdf,.doc'`) |

---

## 🔗 Available Actions

Actions can be assigned to any button or text element using the `action` property.

### Navigation
| Action | Description | Additional Properties |
| :--- | :--- | :--- |
| `goToPage` | Navigate to another screen | `pageIndex` (required) |
| `submitForm` | Validate & submit form data | `successPageIndex`, `submitAction` |

### Native Features
| Action | Description | Required Card Data |
| :--- | :--- | :--- |
| `downloadVcf` | Generate & download .vcf contact file | `user_name`, `email`, `mobile_number` |
| `shareCard` | Open native Web Share API | — |
| `callPhone` | Open phone dialer | `mobile_number` |
| `openEmail` | Open email app | `email` |
| `openMap` | Open Google Maps with address | `address` |
| `openWebsite` | Open company website | `website` |
| `openWhatsApp` | Open WhatsApp chat | `mobile_number` |
| `downloadPresentations` | Open presentation link | `presentations` |
| `installApp` | Trigger "Add to Home Screen" PWA install | — |

### Social Media
| Action | Description | Required Card Data |
| :--- | :--- | :--- |
| `openFacebook` | Open Facebook profile | `facebook_url` |
| `openLinkedIn` | Open LinkedIn profile | `linkedin_url` |
| `openInstagram` | Open Instagram profile | `instagram_url` |
| `openTwitter` | Open X/Twitter profile | `x_url` |

> **Custom Actions:** You can add new actions by creating a function in `src/actions.js` and registering it in the `actionMap` object.

### 📲 Add to Home Screen (PWA Install)

The `installApp` action triggers the browser's native "Add to Home Screen" install prompt. This works as a Progressive Web App (PWA).

**Usage Example:**
```javascript
{
  id: 'install_btn',
  label: 'Install App',
  x: 540, y: 1600, width: 500, height: 90,
  anchorX: 0.5, anchorY: 0.5,
  action: 'installApp',
  backgroundColor: '#10B981',
  color: '#ffffff',
  borderRadius: '16px',
  fontSize: 34,
}
```

**How it works:**
| Platform | Behavior |
| :--- | :--- |
| Chrome / Edge (Android & Desktop) | Shows native browser install dialog |
| iOS Safari | Shows manual instructions (Share → Add to Home Screen) |
| Already installed | Shows "already installed" message |

**Requirements for PWA Install:**
- `public/manifest.json` — Web app manifest (already included)
- `public/sw.js` — Service worker (already included)
- HTTPS — Required in production (localhost works for dev)
- Replace the placeholder icon in `manifest.json` with a proper 192×192 and 512×512 app icon

---

## 🎨 Common Styling Properties

These optional properties work on **ALL element types** (text, image, button, social, input):

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `rotation` | `Number` | Rotate element (degrees) | `rotation: -10` |
| `scale` | `Number` | Scale factor | `scale: 1.05` |
| `opacity` | `Number` | Transparency (0–1) | `opacity: 0.8` |
| `zIndex` | `Number` | Layering order | `zIndex: 50` |
| `borderRadius` | `String` | Rounded corners | `borderRadius: '16px'` |
| `shadow` | `String` | CSS box-shadow | `shadow: '0 8px 32px rgba(0,0,0,0.35)'` |
| `border` | `String` | CSS border | `border: '2px solid #0f8dc8'` |
| `backgroundColor` | `String` | Background color | `backgroundColor: '#00000050'` |
| `padding` | `String` | CSS padding | `padding: '10px 20px'` |
| `filter` | `String` | CSS filter | `filter: 'brightness(1.1)'` |
| `objectFit` | `String` | Image sizing | `objectFit: 'cover'` |

---

## 🛠 Developer Debug Panel

The DVC includes a built-in **Developer Debug Panel** for testing and development. Click the **⚙ gear icon** at the bottom-left of the card to toggle it.

### Features

| Feature | Description |
| :--- | :--- |
| **Screen Info** | Shows current screen name and index |
| **goToPage Navigation** | Clickable buttons to instantly jump to any screen |
| **Element Counter** | Shows count of texts, images, buttons, socials, inputs on current screen |
| **Live Form State** | Real-time JSON view of all form field values |
| **Validation Errors** | Shows active validation errors as JSON |
| **Card Data Inspector** | Full JSON dump of the API card data |

### Usage Examples

**Quick Page Navigation:**
Click any screen button in the debug panel to instantly navigate — equivalent to calling `goToPage` with that index.

**Form Debugging:**
1. Open the debug panel on a form screen
2. Fill in some fields
3. Watch the "Live Form State" update in real-time
4. Click submit with invalid data to see "Validation Errors" appear

> **Note:** The debug panel is automatically included in development. For production builds, you can remove it by deleting the debug panel section from `DvcRenderer.jsx` or wrapping it in an environment check.

---

## 💡 Pro Tips

- **Element Ordering:** Elements render in array order. If a button appears under an image, move it lower in the array (or use `zIndex`).
- **Center Alignment:** Set `x: 540` and `anchorX: 0.5` to perfectly center an element horizontally.
- **API Data Override:** Use `dataKey` with `fallbackImage` to gracefully handle missing API data.
- **Custom Fonts:** Add Google Fonts to `index.css` and use `fontFamily` on text elements.
- **Form Submission:** The `submitForm` action validates all `inputs[]` on the current screen, shows a success overlay, then redirects to `successPageIndex`.
- **CSS Buttons vs Image Buttons:** CSS buttons (with `label`) are lighter and more customizable. Image buttons (with `image`) are pixel-perfect from Figma.

---

## 📦 Card Data Fields

When using API data, these are the standard `cardData` keys:

| Key | Type | Description |
| :--- | :--- | :--- |
| `user_name` | `String` | Full name |
| `user_designation` | `String` | Job title |
| `department_name` | `String` | Department |
| `email` | `String` | Email address |
| `mobile_number` | `String` | Phone number |
| `address` | `String` | Physical address |
| `company_name` | `String` | Company name |
| `website` | `String` | Company website URL |
| `facebook_url` | `String` | Facebook profile URL |
| `instagram_url` | `String` | Instagram profile URL |
| `linkedin_url` | `String` | LinkedIn profile URL |
| `x_url` | `String` | X/Twitter profile URL |
| `qr_code` | `String` | QR code image URL or base64 |
| `presentations` | `String` | Presentations download URL |
| `profile_picture` | `String` | Profile photo URL or base64 |

---

## 🧪 Complete Example: A Full DVC Screen

Here's a complete screen configuration with every element type:

```javascript
{
  index: 0,
  name: 'Home',
  background: 'bg.jpg',

  // Text elements
  texts: [
    {
      id: 'user_name',
      dataKey: 'user_name',
      x: 540, y: 452,
      fontSize: 60, color: '#FFFFFF',
      align: 'center', anchorX: 0.5,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    {
      id: 'user_designation',
      dataKey: 'user_designation',
      x: 540, y: 555,
      fontSize: 38, color: '#4886B1',
      align: 'center', anchorX: 0.5,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  ],

  // Buttons
  buttons: [
    {
      id: 'save_contact_btn',
      image: 'save_contact_btn.png',
      x: 126, y: 678, width: 400,
      anchorX: 0, anchorY: 0,
      action: 'downloadVcf',
      hoverScale: 1.06, activeScale: 0.95,
    },
    {
      id: 'contact_form_btn',
      label: 'Contact Us',
      x: 540, y: 1700, width: 500, height: 90,
      anchorX: 0.5, anchorY: 0.5,
      action: 'goToPage', pageIndex: 2,
      backgroundColor: '#0f8dc8', color: '#fff',
      borderRadius: '16px', fontSize: 34,
    },
  ],

  // Decorative images
  images: [
    {
      id: 'logo',
      image: 'logo.png',
      x: 540, y: 100, width: 200,
      anchorX: 0.5, anchorY: 0,
    },
    {
      id: 'qr_code',
      dataKey: 'qr_code',
      fallbackImage: 'qr_placeholder.png',
      x: 700, y: 1020, width: 236, height: 236,
      anchorX: 0, anchorY: 0,
      borderRadius: '16px',
      shadow: '0 8px 32px rgba(0,0,0,0.35)',
    },
  ],

  // Social icons
  socials: [
    { id: 'fb',    image: 'fb.png',       x: 178, y: 1498, width: 80, action: 'openFacebook',  hoverScale: 1.15 },
    { id: 'insta', image: 'insta.png',     x: 618, y: 1498, width: 80, action: 'openInstagram', hoverScale: 1.15 },
    { id: 'x',     image: 'twitter.png',   x: 837, y: 1507, width: 70, action: 'openTwitter',   hoverScale: 1.15 },
  ],

  // Form inputs (optional)
  inputs: [],
}
```

---

## 📄 License

This project is proprietary to Kunvarji Wealth.
