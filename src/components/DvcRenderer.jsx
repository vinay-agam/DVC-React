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
   * Get a dynamic font size, supporting automatic bounding-box scaling (autoFit).
   */
  const getDynamicFontSize = (txt, content) => {
    let baseSize = txt.fontSize;

    if (txt.autoFit && txt.width && txt.height) {
      const L = (content || '').length || 1;
      const W = txt.width;
      const H = txt.height;

      // Estimate longest word length to ensure single words don't overflow horizontally
      const words = (content || '').split(/\s+/);
      const longestWordLength = Math.max(...words.map(w => w.length), 1);

      // 1. Scale down based on character volume inside W x H box
      // Target area: W * H. Area taken by one char: charWidth * charHeight ≈ (F * 0.52) * (F * 1.25) = F^2 * 0.65
      // So L * F^2 * 0.65 <= W * H  =>  F <= Math.sqrt((W * H) / (L * 0.65))
      const volumeF = Math.sqrt((W * H) / (L * 0.65));

      // 2. Ensure font height is not taller than container height
      const heightF = H / 1.15;

      // 3. Ensure longest word fits horizontally
      const wordF = W / (longestWordLength * 0.52);

      // Limit to base size (never scale up, only down)
      baseSize = Math.min(baseSize, volumeF, heightF, wordF);
    } else {
      // Fallback to tiered font sizing if autoFit is not enabled
      return getTieredFontCqw(txt.fontSize, content);
    }

    return fontCqw(baseSize);
  };

  /**
   * Convert a Figma pixel dimension to cqw (container query width units).
   * This keeps elements proportional to the card container width.
   */
  const sizeCqw = (px) => (px / REFERENCE_FRAME.width) * 100;

  /**
   * Helper to build style objects with advanced custom properties
   */
  const getAdvancedStyles = (item) => {
    const styles = {};

    if (item.opacity !== undefined) styles.opacity = item.opacity;
    if (item.zIndex !== undefined) styles.zIndex = item.zIndex;
    if (item.borderRadius !== undefined) styles.borderRadius = item.borderRadius;
    if (item.shadow !== undefined) styles.boxShadow = item.shadow;
    if (item.border !== undefined) styles.border = item.border;
    if (item.backgroundColor !== undefined) styles.backgroundColor = item.backgroundColor;
    if (item.padding !== undefined) styles.padding = item.padding;
    if (item.filter !== undefined) styles.filter = item.filter;
    if (item.objectFit !== undefined) styles.objectFit = item.objectFit;

    // CSS variables for interactive components custom hover scales
    if (item.hoverScale !== undefined) styles['--hover-scale'] = item.hoverScale;
    if (item.activeScale !== undefined) styles['--active-scale'] = item.activeScale;

    return styles;
  };

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
                  transform: `translate(${-(img.anchorX || 0) * 100}%, ${-(img.anchorY || 0) * 100}%) rotate(${img.rotation || 0}deg) scale(${img.scale || 1})`,
                  ...getAdvancedStyles(img),
                }}
              />
            );
          })}

          {/* ── Text Elements ────────────────────────── */}
          {screen.texts && screen.texts.map((txt) => {
            const content = resolveText(txt);
            if (!content) return null;

            const responsiveFontSize = getDynamicFontSize(txt, content);
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
                  ...(txt.width ? { width: `${sizeCqw(txt.width)}cqw` } : { maxWidth: '60%' }),
                  ...(txt.height && { height: `${sizeCqw(txt.height)}cqw` }),
                  ...(txt.align && { textAlign: txt.align }),
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
                  fontFamily: txt.fontFamily || "'Inter', system-ui, sans-serif",
                  letterSpacing: txt.letterSpacing || '-0.01em',
                  whiteSpace: txt.whiteSpace || (txt.width ? 'normal' : 'nowrap'),
                  overflow: txt.overflow || (txt.width || txt.height ? 'hidden' : 'hidden'),
                  textOverflow: txt.textOverflow || (txt.width ? 'clip' : 'ellipsis'),
                  wordBreak: txt.width ? 'break-word' : undefined,
                  transform: `rotate(${txt.rotation || 0}deg) scale(${txt.scale || 1})`,
                  ...(txt.lineHeight !== undefined && { lineHeight: txt.lineHeight }),
                  ...(txt.fontStyle !== undefined && { fontStyle: txt.fontStyle }),
                  ...(txt.textTransform !== undefined && { textTransform: txt.textTransform }),
                  ...getAdvancedStyles(txt),
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
                transform: `translate(${-(btn.anchorX || 0) * 100}%, ${-(btn.anchorY || 0) * 100}%) rotate(${btn.rotation || 0}deg) scale(${btn.scale || 1})`,
                overflow: btn.borderRadius ? 'hidden' : undefined,
                ...getAdvancedStyles(btn),
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
                  ...(btn.borderRadius && { borderRadius: btn.borderRadius }),
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
                  transform: `rotate(${social.rotation || 0}deg) scale(${social.scale || 1})`,
                  overflow: social.borderRadius ? 'hidden' : undefined,
                  ...getAdvancedStyles(social),
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
                    ...(social.borderRadius && { borderRadius: social.borderRadius }),
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
