/**
 * Card Action Handlers
 * ─────────────────────────────────────────────────────────
 * All interactive actions for the DVC card.
 * Ported from game.js — each function is self-contained.
 */

/**
 * Generate and download a VCF contact file.
 */
export function downloadVcf(cardData) {
  const name = cardData.user_name || '';
  const designation = cardData.user_designation || '';
  const company = cardData.company_name || '';
  const phone = cardData.mobile_number || '';
  const email = cardData.email || '';
  const address = cardData.address || '';
  const website = cardData.website || '';
  const facebook = cardData.facebook_url || '';
  const linkedin = cardData.linkedin_url || '';
  const instagram = cardData.instagram_url || '';
  const xProfile = cardData.x_url || '';
  const profilePhoto = cardData.profile_picture || '';
  const cardUrl = window.location.href || '';

  if (!name && !company && !phone && !email) {
    alert('Contact details are not available to save.');
    return;
  }

  const vcfLines = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (name) {
    vcfLines.push('N:' + name + ';;;;');
    vcfLines.push('FN:' + name);
  }
  if (company) vcfLines.push('ORG:' + company);
  if (designation) vcfLines.push('TITLE:' + designation);
  if (phone) vcfLines.push('TEL;TYPE=CELL,VOICE:' + phone);
  if (email) vcfLines.push('EMAIL;TYPE=INTERNET:' + email);
  if (address) {
    vcfLines.push('ADR;TYPE=WORK:;;' + address.replace(/\n/g, ';') + ';;;;');
  }

  // Labeled URLs (iPhone-friendly)
  let itemIndex = 1;
  function addLabeledUrl(label, url) {
    if (!url) return;
    vcfLines.push('item' + itemIndex + '.URL:' + url);
    vcfLines.push('item' + itemIndex + '.X-ABLabel:' + label);
    itemIndex++;
  }

  if (website) addLabeledUrl('Website', website);

  // WhatsApp link
  if (phone) {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone) {
      addLabeledUrl('WhatsApp', 'https://wa.me/' + cleanedPhone);
    }
  }

  if (linkedin) addLabeledUrl('LinkedIn', linkedin);
  if (facebook) addLabeledUrl('Facebook', facebook);
  if (instagram) addLabeledUrl('Instagram', instagram);
  if (xProfile) addLabeledUrl('X', xProfile);
  if (cardUrl) addLabeledUrl('Digital Card', cardUrl);

  // Profile Photo
  if (profilePhoto) {
    const base64Photo = profilePhoto.startsWith('data:')
      ? profilePhoto.split(',')[1]
      : profilePhoto;
    vcfLines.push('PHOTO;ENCODING=BASE64;TYPE=JPEG:' + base64Photo);
  }

  vcfLines.push('END:VCARD');

  const vcf = vcfLines.join('\r\n');
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (name ? name.replace(/\s+/g, '_') : 'contact') + '.vcf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Share card using Web Share API.
 */
export function shareCard() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href,
    }).catch(console.error);
  } else {
    // Fallback: copy link to clipboard
    navigator.clipboard?.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Share is not supported on this device/browser.');
    });
  }
}

/**
 * Open phone dialer.
 */
export function callPhone(cardData) {
  const contact = (cardData.mobile_number || '').trim();
  if (!contact) {
    alert('Phone number is not available for this card.');
    return;
  }
  window.open('tel:' + contact, '_self');
}

/**
 * Open email client.
 */
export function openEmail(cardData) {
  const mailId = (cardData.email || '').trim();
  if (!mailId) {
    alert('Email address is not available for this card.');
    return;
  }
  window.open('mailto:' + mailId, '_self');
}

/**
 * Open Google Maps with address.
 */
export function openMap(cardData) {
  const address = (cardData.address || '').trim();
  if (!address) {
    alert('Address is not available for this card.');
    return;
  }
  if (address.toLowerCase().startsWith('http://') || address.toLowerCase().startsWith('https://')) {
    window.open(address, '_blank');
    return;
  }
  const encodedAddress = encodeURIComponent(address);
  window.open('https://www.google.com/maps/search/?api=1&query=' + encodedAddress, '_blank');
}

/**
 * Open company website.
 */
export function openWebsite(cardData) {
  const url = (cardData.website || '').trim();
  if (!url) {
    alert('Website URL is not available for this card.');
    return;
  }
  window.open(url, '_blank');
}

/**
 * Open WhatsApp chat.
 */
export function openWhatsApp(cardData) {
  const phone = (cardData.mobile_number || '').trim();
  if (!phone) {
    alert('WhatsApp number is not available for this card.');
    return;
  }
  const message = "Hi.. I am interested in your products. Let's connect";
  const url = 'https://api.whatsapp.com/send?phone=' + phone + '&text=%20' + encodeURIComponent(message);
  window.open(url, '_blank');
}

/**
 * Download presentations.
 */
export function downloadPresentations(cardData) {
  const presentations = cardData.presentations;
  if (!presentations) {
    alert('No presentations available for this card.');
    return;
  }
  window.open(presentations, '_blank');
}

// ── Social Media Openers ────────────────────────────────

export function openFacebook(cardData) {
  const url = (cardData.facebook_url || '').trim();
  if (!url) { alert('Facebook link is not available.'); return; }
  window.open(url, '_blank');
}

export function openLinkedIn(cardData) {
  const url = (cardData.linkedin_url || '').trim();
  if (!url) { alert('LinkedIn link is not available.'); return; }
  window.open(url, '_blank');
}

export function openInstagram(cardData) {
  const url = (cardData.instagram_url || '').trim();
  if (!url) { alert('Instagram link is not available.'); return; }
  window.open(url, '_blank');
}

export function openTwitter(cardData) {
  const url = (cardData.x_url || '').trim();
  if (!url) { alert('X / Twitter link is not available.'); return; }
  window.open(url, '_blank');
}

/**
 * Action dispatcher — maps action string names to handler functions.
 */
export const actionMap = {
  downloadVcf,
  shareCard,
  callPhone,
  openEmail,
  openMap,
  openWebsite,
  openWhatsApp,
  downloadPresentations,
  openFacebook,
  openLinkedIn,
  openInstagram,
  openTwitter,
};

/**
 * Execute an action by name.
 */
export function executeAction(actionName, cardData) {
  const handler = actionMap[actionName];
  if (handler) {
    handler(cardData);
  } else {
    console.warn('Unknown action:', actionName);
  }
}
