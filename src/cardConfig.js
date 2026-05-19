/**
 * Card Layout Configuration — Multi-Page SPA
 * ─────────────────────────────────────────────────────────
 * This is the ONLY file you edit to add pages, assets, and navigation.
 *
 * STRUCTURE:
 *   screens[] → Array of page objects, each identified by `index`
 *   Each screen has: background, texts[], buttons[], images[], socials[]
 *   Navigation: use action "goToPage" with pageIndex to switch screens
 *
 * HOW TO ADD A NEW PAGE:
 *   1. Add a new object to the `screens` array below
 *   2. Give it a unique `index` number
 *   3. Add a background image, texts, buttons, images as needed
 *   4. To navigate TO this page, add a button on another page with:
 *      { action: "goToPage", pageIndex: YOUR_INDEX }
 *   5. To go BACK, add a back button with:
 *      { action: "goToPage", pageIndex: 0 }
 *
 * FIGMA WORKFLOW:
 *   1. Set your Figma frame to 1080 x 1920
 *   2. Select any layer → copy X, Y, Width, Height from Properties
 *   3. Paste those exact numbers into this config
 *   4. The renderer auto-converts to responsive % and cqw units
 */

// ── Reference Frame (must match your Figma artboard) ────
export const REFERENCE_FRAME = {
  width: 1080,
  height: 1920,
};

// ── Start screen index (shown first on load) ────────────
export const START_SCREEN = 0;

// ── Helper functions (used by the renderer) ─────────────
export function xPct(x) { return (x / REFERENCE_FRAME.width) * 100; }
export function yPct(y) { return (y / REFERENCE_FRAME.height) * 100; }
export function wPct(w) { return (w / REFERENCE_FRAME.width) * 100; }
export function hPct(h) { return (h / REFERENCE_FRAME.height) * 100; }
export function fontCqw(fontSize) { return (fontSize / REFERENCE_FRAME.width) * 100; }
export function sizeCqw(px) { return (px / REFERENCE_FRAME.width) * 100; }

// ═══════════════════════════════════════════════════════════
//  SCREENS — Define all your pages here
// ═══════════════════════════════════════════════════════════

export const screens = [

  // ─────────────────────────────────────────────────────────
  //  SCREEN 0 — Main DVC Card (Home)
  // ─────────────────────────────────────────────────────────
  {
    index: 0,
    name: 'Home',
    background: 'bg.jpg',

    texts: [
      {
        id: 'user_name',
        dataKey: 'user_name',
        x: 540, y: 462,
        fontSize: 65,
        color: '#FFFFFF',
        align: 'center',
        anchorX: 0.5,
        fontWeight: 700,
      },
      {
        id: 'user_designation',
        dataKey: 'user_designation',
        x: 540, y: 555,
        fontSize: 38,
        color: '#4886B1',
        align: 'center',
        anchorX: 0.5,
        fontWeight: 400,
      },
      {
        id: 'department_name',
        dataKey: 'department_name',
        x: 165, y: 908,
        fontSize: 25,
        color: '#FA353A',
        align: 'left',
        anchorX: 0,
        fontWeight: 500,
      },
      {
        id: 'mobile_number',
        dataKey: 'mobile_number',
        x: 164, y: 1128,
        fontSize: 46,
        color: '#FFFFFF',
        align: 'left',
        anchorX: 0,
        action: 'callPhone',
      },
      {
        id: 'email',
        dataKey: 'email',
        x: 164, y: 1296,
        fontSize: 46,
        color: '#FFFFFF',
        align: 'left',
        anchorX: 0,
        action: 'openEmail',
      },
    ],

    buttons: [
      {
        id: 'save_contact_btn',
        image: 'save_contact_btn.png',
        x: 126, y: 678, width: 400,
        anchorX: 0, anchorY: 0,
        action: 'downloadVcf',
      },
      {
        id: 'web_btn',
        image: 'web_btn.png',
        x: 570, y: 678, width: 400,
        anchorX: 0, anchorY: 0,
        action: 'openWebsite',
      },
      {
        id: 'call_btn',
        image: 'call_btn.png',
        x: 506, y: 838, width: 140,
        anchorX: 0, anchorY: 0,
        action: 'callPhone',
      },
      {
        id: 'mail_btn',
        image: 'mail_btn.png',
        x: 675, y: 838, width: 140,
        anchorX: 0, anchorY: 0,
        action: 'openEmail',
      },
      {
        id: 'location_btn',
        image: 'location_btn.png',
        x: 843, y: 838, width: 140,
        anchorX: 0, anchorY: 0,
        action: 'openMap',
      },
      {
        id: 'presentation_btn',
        image: 'presentation_btn.png',
        x: 41, y: 1696, width: 480,
        anchorX: 0, anchorY: 0,
        // ★ Navigate to Products page (Screen 1)
        action: 'goToPage',
        pageIndex: 1,
      },
      {
        id: 'share_btn',
        image: 'share_btn.png',
        x: 570, y: 1696, width: 480,
        anchorX: 0, anchorY: 0,
        action: 'shareCard',
      },
    ],

    images: [
      {
        id: 'dep_box',
        image: 'box.png',
        x: 127, y: 949, width: 380,
        anchorX: 0, anchorY: 1,
      },
      {
        id: 'qr_placeholder',
        dataKey: 'qr_code',
        fallbackImage: 'qr_placeholder.png',
        x: 832.5, y: 984,
        width: 236, height: 236,
        anchorX: 0.5, anchorY: 0,
      },
    ],

    socials: [
      { id: 'fb',        image: 'fb.png',       x: 178, y: 1498, width: 80, action: 'openFacebook' },
      { id: 'linked_in', image: 'linkedin.png',  x: 399, y: 1498, width: 80, action: 'openLinkedIn' },
      { id: 'insta',     image: 'insta.png',     x: 618, y: 1498, width: 80, action: 'openInstagram' },
      { id: 'x',         image: 'twitter.png',   x: 837, y: 1507, width: 70, action: 'openTwitter' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  //  SCREEN 1 — Products / Presentations Page
  // ─────────────────────────────────────────────────────────
  {
    index: 1,
    name: 'Products',
    background: 'bg.jpg',   // can use a different background image

    texts: [
      {
        id: 'page_title',
        staticText: 'Our Products',      // ← staticText = hardcoded, not from API
        x: 540, y: 200,
        fontSize: 70,
        color: '#FFFFFF',
        align: 'center',
        anchorX: 0.5,
        fontWeight: 700,
      },
      {
        id: 'page_subtitle',
        staticText: 'Explore our range of financial solutions',
        x: 540, y: 300,
        fontSize: 32,
        color: '#4886B1',
        align: 'center',
        anchorX: 0.5,
        fontWeight: 400,
      },
      {
        id: 'company_name',
        dataKey: 'company_name',
        x: 540, y: 1800,
        fontSize: 30,
        color: '#FFFFFF50',
        align: 'center',
        anchorX: 0.5,
        fontWeight: 300,
      },
    ],

    buttons: [
      // ★ Back button — navigates to Home (Screen 0)
      {
        id: 'back_btn',
        image: 'call_btn.png',   // Replace with your own back button image
        x: 80, y: 80, width: 100,
        anchorX: 0.5, anchorY: 0.5,
        action: 'goToPage',
        pageIndex: 0,
      },
    ],

    images: [],
    socials: [],
  },

  // ─────────────────────────────────────────────────────────
  //  SCREEN 2 — Add more pages below...
  // ─────────────────────────────────────────────────────────
  // {
  //   index: 2,
  //   name: 'About',
  //   background: 'bg.jpg',
  //   texts: [ ... ],
  //   buttons: [
  //     { id: 'back', image: 'back.png', x: 80, y: 80, width: 100,
  //       anchorX: 0.5, anchorY: 0.5,
  //       action: 'goToPage', pageIndex: 0 },
  //   ],
  //   images: [],
  //   socials: [],
  // },

];
