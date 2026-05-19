/**
 * API Service
 * ─────────────────────────────────────────────────────────
 * Handles fetching card data and media from the backend.
 */

const API_ENDPOINT = '/cards/kunvarji/portal/api/getIdMasterDataById';

/**
 * Extract slug from the current URL path.
 * e.g., /dvc-react/john-doe_abc123 → "john-doe_abc123"
 */
export function resolveSlug() {
  const path = window.location.pathname || '';
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return '';

  let last = parts[parts.length - 1];

  // Skip index.html / index.php
  if (last.toLowerCase() === 'index.html' || last.toLowerCase() === 'index.php') {
    parts.pop();
    if (parts.length === 0) return '';
    last = parts[parts.length - 1];
  }

  // Skip known directory names
  const skipNames = ['dvc', 'dvc-react', 'kunvarji'];
  if (skipNames.includes(last.toLowerCase())) return '';

  return last;
}

/**
 * Fetch card data from the API using a slug.
 * Returns a normalized card data object.
 */
export async function fetchCardData(slug) {
  if (!slug) throw new Error('No slug provided');

  const form = new FormData();
  form.append('slug', slug);

  const resp = await fetch(API_ENDPOINT, {
    method: 'POST',
    body: form,
  });

  if (!resp.ok) {
    throw new Error('API returned HTTP ' + resp.status);
  }

  const data = await resp.json();

  if (!data || !data.folder) {
    throw new Error('Invalid API response — missing folder');
  }

  // Normalize API response into a clean card data object
  return {
    id: data.id ?? null,
    user_name: ((data.fname || '') + ' ' + (data.lname || '')).trim(),
    user_designation: data.designation ?? null,
    department_name: data.department_name ?? null,
    email: data.mailId ?? null,
    mobile_number: data.mobile ?? null,
    address: data.mapLocation ?? null,
    template_id: data.themeId ?? 'kunvarji',
    theme_id: data.themeColor ?? '01',
    card_url: data.final_slug ?? null,
    status: data.status ?? null,
    company_name: data.companyName ?? 'Kunvarji Wealth',
    website: data.weblink ?? 'https://kunvarjiwealth.com',

    // Social links
    facebook_url: data.facebook ?? null,
    instagram_url: data.instagram ?? null,
    linkedin_url: data.linkedin ?? null,
    x_url: data.twitter ?? null,

    // Media
    image: data.image ?? null,
    qr_code: data.qrcode ?? null,
    contact_vcf: data.contactVCF ?? null,
    presentations: data.presentations ?? null,
    profile_picture: null, // will be fetched separately via proxy

    // Raw API response for anything else
    _raw: data,
  };
}

/**
 * Get a test slug for local development.
 */
export function getLocalTestSlug() {
  // Replace with your test slug
  const testLink = 'https://dev.anurcloud.com/dvc/jane-doe_6qruq9930w';
  try {
    const url = new URL(testLink);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  } catch {
    return '';
  }
}

/**
 * Resolve slug — from URL or fallback to local test slug.
 */
export function getSlug() {
  const slug = resolveSlug();
  if (slug) return slug;

  // Fallback for localhost development
  const host = window.location.hostname || '';
  if (/localhost|127\.0\.0\.1/.test(host)) {
    return getLocalTestSlug();
  }

  return '';
}
