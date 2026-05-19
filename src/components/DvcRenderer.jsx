import { useCallback } from 'react';
import { screens, xPct, yPct, wPct, fontCqw, REFERENCE_FRAME } from '../cardConfig';
import { executeAction } from '../actions';

/**
 * DvcRenderer
 * ─────────────────────────────────────────────────────────
 * The core card rendering component.
 *
 * - Maintains a 9:16 aspect ratio container
 * - Uses @container queries so all children scale proportionally
 * - Converts Figma pixel coordinates to responsive percentages
 * - Button/icon sizes use container query width (cqw) units
 */

// Base path to card image assets
const ASSETS_BASE = '/assets/images/';

export default function DvcRenderer({ cardData, assetsPath, currentPage, setCurrentPage }) {
  const basePath = assetsPath || ASSETS_BASE;
  
  // Find the active screen from the screens array
  const screen = screens.find(s => s.index === currentPage) || screens[0];

  const handleAction = useCallback(
    (item) => {
      if (item.action === 'goToPage') {
        if (item.pageIndex !== undefined && setCurrentPage) {
          setCurrentPage(item.pageIndex);
        }
      } else if (item.action && cardData) {
        executeAction(item.action, cardData);
      }
    },
    [cardData, setCurrentPage]
  );

  /**
   * Resolve the text content for a data key from cardData or static text.
   */
  const resolveText = (txt) => {
    if (txt.staticText) return txt.staticText;
    if (!txt.dataKey || !cardData) return '';
    return cardData[txt.dataKey] || '';
  };

  /**
   * Get a tiered font size reduction for long text (in cqw).
   */
  const getTieredFontCqw = (baseFontSize, text) => {
    const len = (text || '').length;
    let adjusted = baseFontSize;
    if (len > 40) adjusted = baseFontSize - 15;
    else if (len > 30) adjusted = baseFontSize - 10;
    else if (len > 20) adjusted = baseFontSize - 5;
    return fontCqw(adjusted);
  };

  /**
   * Convert a Figma pixel dimension to cqw (container query width units).
   * This keeps elements proportional to the card container width.
   */
  const sizeCqw = (px) => (px / REFERENCE_FRAME.width) * 100;

  if (!screen) return null;

  return (
    /* Outer wrapper — centers the card on screen with dark backdrop */
    <div className="flex items-center justify-center w-full h-full bg-[#0a0f1a] overflow-hidden">
      {/* Card container — 9:16 aspect ratio, responsive, @container */}
      <div
        className="relative @container bg-[#01294c] overflow-hidden shadow-2xl"
        style={{
          aspectRatio: '9 / 16',
          maxHeight: '100vh',
          maxWidth: 'calc(100vh * 9 / 16)',
          width: '100%',
        }}
      >
        {/* ── Background Image ─────────────────────── */}
        {screen.background && (
          <img
            src={basePath + screen.background}
            alt="Card background"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}

        {/* ── All Rendered Elements ────────────────── */}
        <div className="absolute inset-0 stagger-children">

          {/* ── Decorative Images ────────────────────── */}
          {screen.images && screen.images.map((img) => {
            const imgSrc = img.dataKey && cardData?.[img.dataKey]
              ? cardData[img.dataKey]
              : basePath + (img.fallbackImage || img.image);

            return (
              <img
                key={img.id}
                id={img.id}
                src={imgSrc}
                alt={img.id}
                draggable={false}
                className="absolute"
                style={{
                  left: `${xPct(img.x)}%`,
                  top: `${yPct(img.y)}%`,
                  ...(img.width && { width: `${sizeCqw(img.width)}cqw` }),
                  ...(img.height && { height: `${sizeCqw(img.height)}cqw` }),
                  transform: `translate(${-(img.anchorX || 0) * 100}%, ${-(img.anchorY || 0) * 100}%)`,
                }}
              />
            );
          })}

          {/* ── Text Elements ────────────────────────── */}
          {screen.texts && screen.texts.map((txt) => {
            const content = resolveText(txt);
            if (!content) return null;

            const responsiveFontSize = getTieredFontCqw(txt.fontSize, content);
            const isClickable = !!txt.action;
            const isCentered = txt.anchorX === 0.5;

            // For centered text: position the div to span full width and use text-align: center
            // For left-aligned text: position at x and let it flow right
            const positionStyle = isCentered
              ? {
                  left: '5%',
                  width: '90%',
                  textAlign: 'center',
                  top: `${yPct(txt.y)}%`,
                }
              : {
                  left: `${xPct(txt.x)}%`,
                  top: `${yPct(txt.y)}%`,
                  maxWidth: '60%',
                };

            return (
              <div
                key={txt.id}
                id={txt.id}
                className={`absolute ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                style={{
                  ...positionStyle,
                  fontSize: `${responsiveFontSize}cqw`,
                  color: txt.color,
                  fontWeight: txt.fontWeight || 400,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onClick={isClickable ? () => handleAction(txt) : undefined}
              >
                {content}
              </div>
            );
          })}

          {/* ── Image Buttons ────────────────────────── */}
          {screen.buttons && screen.buttons.map((btn) => (
            <button
              key={btn.id}
              id={btn.id}
              className="absolute btn-glow p-0 border-0 bg-transparent"
              style={{
                left: `${xPct(btn.x)}%`,
                top: `${yPct(btn.y)}%`,
                transform: `translate(${-(btn.anchorX || 0) * 100}%, ${-(btn.anchorY || 0) * 100}%)`,
              }}
              onClick={() => handleAction(btn)}
              aria-label={btn.id.replace(/_/g, ' ')}
            >
              <img
                src={basePath + btn.image}
                alt={btn.id.replace(/_/g, ' ')}
                draggable={false}
                className="max-w-none"
                style={{
                  width: `${sizeCqw(btn.width || 380)}cqw`,
                }}
              />
            </button>
          ))}

          {/* ── Social Media Icons ────────────────────── */}
          {screen.socials && screen.socials.map((social) => {
            // Only render active if the card data has this social link
            const socialKeyMap = {
              openFacebook: 'facebook_url',
              openLinkedIn: 'linkedin_url',
              openInstagram: 'instagram_url',
              openTwitter: 'x_url',
            };
            const dataKey = socialKeyMap[social.action];
            const hasLink = dataKey && cardData?.[dataKey];

            return (
              <button
                key={social.id}
                id={social.id}
                className={`absolute btn-glow p-0 border-0 bg-transparent ${!hasLink ? 'opacity-30 cursor-not-allowed' : ''}`}
                style={{
                  left: `${xPct(social.x)}%`,
                  top: `${yPct(social.y)}%`,
                }}
                onClick={hasLink ? () => handleAction(social) : undefined}
                disabled={!hasLink}
                aria-label={social.id.replace(/_/g, ' ')}
              >
                <img
                  src={basePath + social.image}
                  alt={social.id}
                  draggable={false}
                  className="max-w-none"
                  style={{
                    width: `${sizeCqw(social.width || 140)}cqw`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
