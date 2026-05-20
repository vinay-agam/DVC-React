import { useState, useCallback, useMemo } from 'react';
import { screens, xPct, yPct, wPct, fontCqw, REFERENCE_FRAME, sizeCqw as sizeCqwConfig } from '../cardConfig';
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

  // ── Form State Management ─────────────────────────────────
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Developer Debug Panel ──────────────────────────────────
  const [showDevPanel, setShowDevPanel] = useState(false);

  /**
   * Get the correct CSS transform-origin based on the element's anchor point.
   * This ensures that rotation and scale pivot from the anchor position,
   * not from the default center (50% 50%).
   */
  const getTransformOrigin = (item) => {
    const ax = item.anchorX !== undefined ? item.anchorX : 0;
    const ay = item.anchorY !== undefined ? item.anchorY : 0;
    return `${ax * 100}% ${ay * 100}%`;
  };

  // Handle standard input change
  const handleInputChange = (inputId, value) => {
    setFormData(prev => ({
      ...prev,
      [inputId]: value
    }));
    // Clear validation error when user interacts
    if (formErrors[inputId]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[inputId];
        return copy;
      });
    }
  };

  const handleAction = useCallback(
    (item) => {
      if (item.action === 'goToPage') {
        if (item.pageIndex !== undefined && setCurrentPage) {
          // Clear any dynamic form inputs before navigating
          setFormData({});
          setFormErrors({});
          setCurrentPage(item.pageIndex);
        }
      } else if (item.action === 'submitForm') {
        // Run Form Validation
        const currentInputs = screen.inputs || [];
        const errors = {};
        
        currentInputs.forEach(input => {
          const value = formData[input.id];
          const hasValue = value !== undefined && value !== null && String(value).trim() !== '';

          // 1. Required check
          if (input.required && !hasValue) {
            errors[input.id] = `${input.label || input.placeholder || 'This field'} is required`;
            return;
          }

          // 2. Email format check
          if (input.type === 'email' && hasValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[input.id] = 'Please enter a valid email address';
              return;
            }
          }

          // 3. Custom pattern regex validation
          if (input.pattern && hasValue) {
            try {
              const regex = new RegExp(input.pattern);
              if (!regex.test(value)) {
                errors[input.id] = input.patternMessage || 'Invalid format';
                return;
              }
            } catch (e) {
              console.error('Invalid regex pattern configured:', input.pattern);
            }
          }

          // 4. MinLength check
          if (input.minLength && hasValue && String(value).length < input.minLength) {
            errors[input.id] = `Must be at least ${input.minLength} characters`;
            return;
          }

          // 5. Checkbox validation
          if (input.type === 'checkbox' && input.required && !value) {
            errors[input.id] = 'You must agree to continue';
            return;
          }
        });

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }

        // ── Validation Successful! ───────────────────────────
        setShowSuccess(true);

        // Dispatch action
        if (item.submitAction) {
          executeAction(item.submitAction, { ...cardData, formData });
        } else {
          console.log('Lead form data submitted:', formData);
        }

        // Clear Form States
        setFormData({});
        setFormErrors({});

        // Redirect after a beautiful brief overlay celebration
        setTimeout(() => {
          setShowSuccess(false);
          if (item.successPageIndex !== undefined && setCurrentPage) {
            setCurrentPage(item.successPageIndex);
          }
        }, 2200);

      } else if (item.action && cardData) {
        executeAction(item.action, cardData);
      }
    },
    [cardData, setCurrentPage, screen, formData]
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

        {/* ── Submission Success Toast Celebration ──── */}
        {showSuccess && (
          <div className="success-overlay-backdrop">
            <div 
              className="success-card-pop"
              style={{
                width: `${sizeCqw(650)}cqw`,
                height: `${sizeCqw(450)}cqw`,
              }}
            >
              <div 
                className="success-check-circle"
                style={{
                  width: `${sizeCqw(130)}cqw`,
                  height: `${sizeCqw(130)}cqw`,
                }}
              >
                <div className="success-check-icon" />
              </div>
              <h2 
                className="text-white font-bold mt-[20px] text-center"
                style={{ fontSize: `${sizeCqw(42)}cqw` }}
              >
                Form Submitted!
              </h2>
              <p 
                className="text-[#4886B1] mt-[10px] text-center px-[30px]"
                style={{ fontSize: `${sizeCqw(28)}cqw` }}
              >
                Thank you. Your details were recorded successfully.
              </p>
            </div>
          </div>
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
                  transformOrigin: getTransformOrigin(img),
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
                  transformOrigin: getTransformOrigin(txt),
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

          {/* ── Interactive Input Fields ────────────── */}
          {screen.inputs && screen.inputs.map((input) => {
            const isInvalid = !!formErrors[input.id];
            const val = formData[input.id] || '';
            const customFontSize = input.fontSize ? sizeCqw(input.fontSize) : sizeCqw(32);
            
            const positionStyle = {
              left: `${xPct(input.x)}%`,
              top: `${yPct(input.y)}%`,
              width: `${sizeCqw(input.width || 800)}cqw`,
              height: `${sizeCqw(input.height || 90)}cqw`,
              transform: `translate(${-(input.anchorX || 0) * 100}%, ${-(input.anchorY || 0) * 100}%) rotate(${input.rotation || 0}deg) scale(${input.scale || 1})`,
              transformOrigin: getTransformOrigin(input),
              ...getAdvancedStyles(input),
            };

            // Pre-calculate elements for labels & errors positioning
            const fieldHeight = input.height || 90;
            const anchorYOffset = (input.anchorY || 0) * fieldHeight;

            return (
              <div key={input.id} className="contents">
                {/* 1. Above-Input Floating Label */}
                {input.label && (
                  <div 
                    className="absolute text-[#4886B1] font-medium pointer-events-none select-none"
                    style={{
                      left: `${xPct(input.x)}%`,
                      top: `calc(${yPct(input.y)}% - ${sizeCqw(anchorYOffset + 35)}cqw)`,
                      width: `${sizeCqw(input.width || 800)}cqw`,
                      fontSize: `${sizeCqw(26)}cqw`,
                      transform: `translate(${-(input.anchorX || 0) * 100}%, 0%)`,
                      zIndex: (input.zIndex || 5) + 1,
                    }}
                  >
                    {input.label} {input.required && <span className="text-[#FA353A] font-bold">*</span>}
                  </div>
                )}

                {/* 2. Validation Error Notification Label */}
                {isInvalid && (
                  <div 
                    className="absolute text-[#FA353A] font-medium pointer-events-none select-none"
                    style={{
                      left: `${xPct(input.x)}%`,
                      top: `calc(${yPct(input.y)}% + ${sizeCqw((1 - (input.anchorY || 0)) * fieldHeight + 6)}cqw)`,
                      width: `${sizeCqw(input.width || 800)}cqw`,
                      fontSize: `${sizeCqw(22)}cqw`,
                      transform: `translate(${-(input.anchorX || 0) * 100}%, 0%)`,
                      zIndex: (input.zIndex || 5) + 2,
                    }}
                  >
                    {formErrors[input.id]}
                  </div>
                )}

                {/* 3. Input switch renderer */}
                {(() => {
                  if (['text', 'email', 'tel'].includes(input.type)) {
                    return (
                      <div className="contents">
                        <input
                          type={input.type}
                          id={input.id}
                          placeholder={input.placeholder || ''}
                          value={val}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          className={`absolute form-input-premium px-[20px] ${isInvalid ? 'form-input-error' : ''}`}
                          style={{
                            ...positionStyle,
                            fontSize: `${customFontSize}cqw`,
                            borderRadius: input.borderRadius || `${sizeCqw(12)}cqw`,
                          }}
                        />
                        {/* Clear (X) Action overlay */}
                        {val && (
                          <button
                            type="button"
                            onClick={() => handleInputChange(input.id, '')}
                            className="absolute text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
                            style={{
                              left: `${xPct(input.x) + wPct(input.width || 800) - 4.5}%`,
                              top: `calc(${yPct(input.y)}% + ${sizeCqw((0.5 - (input.anchorY || 0)) * fieldHeight)}cqw)`,
                              transform: `translate(-50%, -50%)`,
                              fontSize: `${sizeCqw(36)}cqw`,
                              width: `${sizeCqw(45)}cqw`,
                              height: `${sizeCqw(45)}cqw`,
                              zIndex: (input.zIndex || 5) + 3,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  }

                  if (input.type === 'textarea') {
                    return (
                      <textarea
                        id={input.id}
                        placeholder={input.placeholder || ''}
                        value={val}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className={`absolute form-input-premium form-textarea-premium p-[20px] ${isInvalid ? 'form-input-error' : ''}`}
                        style={{
                          ...positionStyle,
                          fontSize: `${customFontSize}cqw`,
                          borderRadius: input.borderRadius || `${sizeCqw(12)}cqw`,
                        }}
                      />
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <select
                        id={input.id}
                        value={val}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className={`absolute form-input-premium form-select-premium px-[20px] ${isInvalid ? 'form-input-error' : ''}`}
                        style={{
                          ...positionStyle,
                          fontSize: `${customFontSize}cqw`,
                          borderRadius: input.borderRadius || `${sizeCqw(12)}cqw`,
                        }}
                      >
                        {input.placeholder && <option value="" disabled>{input.placeholder}</option>}
                        {(input.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    );
                  }

                  if (input.type === 'checkbox') {
                    const isChecked = !!val;
                    const toggleCheckbox = () => handleInputChange(input.id, !isChecked);

                    return (
                      <div
                        id={input.id}
                        className="absolute flex items-center cursor-pointer select-none"
                        style={{
                          left: `${xPct(input.x)}%`,
                          top: `${yPct(input.y)}%`,
                          width: `${sizeCqw(input.width || 800)}cqw`,
                          height: `${sizeCqw(input.height || 60)}cqw`,
                          transform: `translate(${-(input.anchorX || 0) * 100}%, ${-(input.anchorY || 0) * 100}%) rotate(${input.rotation || 0}deg) scale(${input.scale || 1})`,
                          zIndex: input.zIndex || 5,
                        }}
                        onClick={toggleCheckbox}
                      >
                        {/* Custom asset vs sleek CSS box */}
                        {input.checkedImage && input.uncheckedImage ? (
                          <img
                            src={basePath + (isChecked ? input.checkedImage : input.uncheckedImage)}
                            alt="checkbox state"
                            draggable={false}
                            style={{
                              width: `${sizeCqw(input.checkboxSize || 50)}cqw`,
                              height: `${sizeCqw(input.checkboxSize || 50)}cqw`,
                              objectFit: 'contain',
                              ...getAdvancedStyles(input),
                            }}
                          />
                        ) : (
                          <div
                            className={`form-checkbox-custom ${isChecked ? 'checked' : ''} ${isInvalid ? 'form-input-error' : ''}`}
                            style={{
                              width: `${sizeCqw(input.checkboxSize || 50)}cqw`,
                              height: `${sizeCqw(input.checkboxSize || 50)}cqw`,
                              borderRadius: input.borderRadius || `${sizeCqw(10)}cqw`,
                              ...getAdvancedStyles(input),
                            }}
                          />
                        )}
                        {/* Text labels */}
                        {input.checkboxLabel && (
                          <span
                            className="font-medium"
                            style={{
                              marginLeft: `${sizeCqw(20)}cqw`,
                              fontSize: `${input.fontSize ? sizeCqw(input.fontSize) : sizeCqw(28)}cqw`,
                              color: input.color || 'rgba(255, 255, 255, 0.75)',
                            }}
                          >
                            {input.checkboxLabel}
                          </span>
                        )}
                      </div>
                    );
                  }

                  if (input.type === 'radio') {
                    const selectedOption = val;
                    const direction = input.direction || 'row';

                    return (
                      <div
                        id={input.id}
                        className={`absolute flex ${direction === 'column' ? 'flex-col gap-[15px]' : 'flex-row items-center gap-[30px]'} flex-wrap`}
                        style={{
                          left: `${xPct(input.x)}%`,
                          top: `${yPct(input.y)}%`,
                          width: `${sizeCqw(input.width || 800)}cqw`,
                          height: `${sizeCqw(input.height || 60)}cqw`,
                          transform: `translate(${-(input.anchorX || 0) * 100}%, ${-(input.anchorY || 0) * 100}%) rotate(${input.rotation || 0}deg) scale(${input.scale || 1})`,
                          zIndex: input.zIndex || 5,
                        }}
                      >
                        {(input.options || []).map((opt) => {
                          const isRadioSelected = selectedOption === opt;
                          return (
                            <div
                              key={opt}
                              className="flex items-center cursor-pointer select-none"
                              onClick={() => handleInputChange(input.id, opt)}
                            >
                              {input.checkedImage && input.uncheckedImage ? (
                                <img
                                  src={basePath + (isRadioSelected ? input.checkedImage : input.uncheckedImage)}
                                  alt={opt}
                                  draggable={false}
                                  style={{
                                    width: `${sizeCqw(input.radioSize || 50)}cqw`,
                                    height: `${sizeCqw(input.radioSize || 50)}cqw`,
                                    objectFit: 'contain',
                                    ...getAdvancedStyles(input),
                                  }}
                                />
                              ) : (
                                <div
                                  className={`form-radio-custom ${isRadioSelected ? 'checked' : ''} ${isInvalid ? 'form-input-error' : ''}`}
                                  style={{
                                    width: `${sizeCqw(input.radioSize || 50)}cqw`,
                                    height: `${sizeCqw(input.radioSize || 50)}cqw`,
                                    ...getAdvancedStyles(input),
                                  }}
                                />
                              )}
                              <span
                                className="font-medium"
                                style={{
                                  marginLeft: `${sizeCqw(16)}cqw`,
                                  fontSize: `${input.fontSize ? sizeCqw(input.fontSize) : sizeCqw(28)}cqw`,
                                  color: input.color || 'rgba(255, 255, 255, 0.75)',
                                }}
                              >
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  if (input.type === 'image' || input.type === 'file') {
                    const fileVal = val;
                    const fileName = formData[input.id + '_filename'] || '';
                    
                    const handleFileChange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleInputChange(input.id, reader.result);
                          handleInputChange(input.id + '_filename', file.name);
                        };
                        reader.readAsDataURL(file);
                      }
                    };

                    return (
                      <div
                        key={input.id}
                        className={`absolute form-file-upload-card ${isInvalid ? 'form-input-error' : ''}`}
                        style={{
                          ...positionStyle,
                          borderRadius: input.borderRadius || `${sizeCqw(16)}cqw`,
                        }}
                        onClick={() => document.getElementById(`file_input_${input.id}`).click()}
                      >
                        <input
                          type="file"
                          id={`file_input_${input.id}`}
                          accept={input.accept || 'image/*'}
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        {fileVal ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-black/30">
                            {input.type === 'image' || (input.accept && input.accept.startsWith('image/')) ? (
                              <img
                                src={fileVal}
                                alt="Uploader preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-[8px]">
                                <span style={{ fontSize: `${sizeCqw(45)}cqw` }}>📄</span>
                                <span 
                                  className="text-white/70 max-w-[85%] truncate text-center font-medium"
                                  style={{ fontSize: `${sizeCqw(22)}cqw` }}
                                >
                                  {fileName}
                                </span>
                              </div>
                            )}
                            {/* Clear Upload button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange(input.id, '');
                                handleInputChange(input.id + '_filename', '');
                              }}
                              className="absolute bg-black/75 hover:bg-black/90 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                              style={{
                                top: `${sizeCqw(12)}cqw`,
                                right: `${sizeCqw(12)}cqw`,
                                width: `${sizeCqw(40)}cqw`,
                                height: `${sizeCqw(40)}cqw`,
                                borderRadius: '50%',
                                fontSize: `${sizeCqw(24)}cqw`,
                                zIndex: (input.zIndex || 5) + 3,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-[16px] pointer-events-none select-none">
                            <svg 
                              style={{
                                width: `${sizeCqw(64)}cqw`,
                                height: `${sizeCqw(64)}cqw`,
                              }}
                              className="mb-[8px] text-white/50" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            <span
                              className="font-medium text-white/60"
                              style={{ fontSize: `${input.fontSize ? sizeCqw(input.fontSize) : sizeCqw(28)}cqw` }}
                            >
                              {input.placeholder || 'Upload File'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}

          {/* ── Buttons (Image & CSS Text) ────────────── */}
          {screen.buttons && screen.buttons.map((btn) => {
            const hasImage = !!btn.image;
            const buttonFontSize = btn.fontSize ? sizeCqw(btn.fontSize) : sizeCqw(32);
            
            return (
              <button
                key={btn.id}
                id={btn.id}
                className={`absolute ${hasImage ? 'btn-glow p-0 border-0 bg-transparent' : 'css-btn-premium'}`}
                style={{
                  left: `${xPct(btn.x)}%`,
                  top: `${yPct(btn.y)}%`,
                  transform: `translate(${-(btn.anchorX || 0) * 100}%, ${-(btn.anchorY || 0) * 100}%) rotate(${btn.rotation || 0}deg) scale(${btn.scale || 1})`,
                  transformOrigin: getTransformOrigin(btn),
                  overflow: 'hidden',
                  ...(!hasImage && {
                    width: `${sizeCqw(btn.width || 380)}cqw`,
                    height: `${sizeCqw(btn.height || 90)}cqw`,
                    fontSize: `${buttonFontSize}cqw`,
                    color: btn.color || '#ffffff',
                    backgroundColor: btn.backgroundColor || 'var(--color-card-accent)',
                    borderRadius: btn.borderRadius || `${sizeCqw(12)}cqw`,
                    boxShadow: btn.shadow || '0 4px 15px rgba(15, 141, 200, 0.3)',
                    border: btn.border || 'none',
                    padding: btn.padding || '0 16px',
                  }),
                  ...getAdvancedStyles(btn),
                }}
                onClick={() => handleAction(btn)}
                aria-label={btn.label || btn.id.replace(/_/g, ' ')}
              >
                {hasImage ? (
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
                ) : (
                  btn.label || 'Button'
                )}
              </button>
            );
          })}

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
                  transformOrigin: getTransformOrigin(social),
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

        {/* ── Developer Debug Panel ────────────────── */}
        {/* Toggle Button — fixed gear icon at bottom-left */}
        <button
          onClick={() => setShowDevPanel(prev => !prev)}
          className="absolute z-[9999] flex items-center justify-center border-none cursor-pointer transition-all duration-200"
          style={{
            bottom: `${sizeCqw(20)}cqw`,
            left: `${sizeCqw(20)}cqw`,
            width: `${sizeCqw(56)}cqw`,
            height: `${sizeCqw(56)}cqw`,
            borderRadius: '50%',
            background: showDevPanel ? 'rgba(250, 53, 58, 0.85)' : 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            fontSize: `${sizeCqw(28)}cqw`,
            color: '#fff',
            opacity: 0.7,
          }}
          title="Toggle Developer Debug Panel"
        >
          {showDevPanel ? '✕' : '⚙'}
        </button>

        {showDevPanel && (
          <div
            className="absolute z-[9998] overflow-y-auto"
            style={{
              bottom: `${sizeCqw(90)}cqw`,
              left: `${sizeCqw(20)}cqw`,
              width: `${sizeCqw(680)}cqw`,
              maxHeight: `${sizeCqw(1100)}cqw`,
              background: 'rgba(5, 15, 30, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: `${sizeCqw(16)}cqw`,
              padding: `${sizeCqw(24)}cqw`,
              fontFamily: "'Inter', monospace",
              color: '#e0e0e0',
            }}
          >
            {/* Panel Title */}
            <div
              className="font-bold"
              style={{
                fontSize: `${sizeCqw(28)}cqw`,
                marginBottom: `${sizeCqw(16)}cqw`,
                color: '#0f8dc8',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: `${sizeCqw(10)}cqw`,
              }}
            >
              🛠 Developer Debug Panel
            </div>

            {/* Current Screen Info */}
            <div style={{ fontSize: `${sizeCqw(22)}cqw`, marginBottom: `${sizeCqw(14)}cqw` }}>
              <span style={{ color: '#4886B1' }}>Screen:</span>{' '}
              <span className="font-semibold" style={{ color: '#10B981' }}>
                {screen?.name || '—'} (index: {currentPage})
              </span>
            </div>

            {/* goToPage Navigation */}
            <div style={{ marginBottom: `${sizeCqw(16)}cqw` }}>
              <div className="font-semibold" style={{ fontSize: `${sizeCqw(22)}cqw`, color: '#4886B1', marginBottom: `${sizeCqw(8)}cqw` }}>
                📄 Navigate (goToPage)
              </div>
              <div className="flex flex-wrap" style={{ gap: `${sizeCqw(10)}cqw` }}>
                {screens.map((s) => (
                  <button
                    key={s.index}
                    onClick={() => {
                      setFormData({});
                      setFormErrors({});
                      if (setCurrentPage) setCurrentPage(s.index);
                    }}
                    className="border-none cursor-pointer font-semibold transition-all"
                    style={{
                      padding: `${sizeCqw(10)}cqw ${sizeCqw(20)}cqw`,
                      borderRadius: `${sizeCqw(8)}cqw`,
                      fontSize: `${sizeCqw(20)}cqw`,
                      background: currentPage === s.index
                        ? '#0f8dc8'
                        : 'rgba(255,255,255,0.08)',
                      color: currentPage === s.index ? '#fff' : '#a0b4c8',
                      border: currentPage === s.index
                        ? '1px solid #0f8dc8'
                        : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {s.index}: {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Elements Summary */}
            <div style={{ marginBottom: `${sizeCqw(16)}cqw` }}>
              <div className="font-semibold" style={{ fontSize: `${sizeCqw(22)}cqw`, color: '#4886B1', marginBottom: `${sizeCqw(8)}cqw` }}>
                📊 Current Screen Elements
              </div>
              <div style={{ fontSize: `${sizeCqw(19)}cqw`, lineHeight: 1.6 }}>
                <span style={{ color: '#10B981' }}>Texts:</span> {screen?.texts?.length || 0}
                {' | '}
                <span style={{ color: '#f59e0b' }}>Images:</span> {screen?.images?.length || 0}
                {' | '}
                <span style={{ color: '#ec4899' }}>Buttons:</span> {screen?.buttons?.length || 0}
                {' | '}
                <span style={{ color: '#8b5cf6' }}>Socials:</span> {screen?.socials?.length || 0}
                {' | '}
                <span style={{ color: '#06b6d4' }}>Inputs:</span> {screen?.inputs?.length || 0}
              </div>
            </div>

            {/* Form Data State Inspector */}
            {screen?.inputs && screen.inputs.length > 0 && (
              <div style={{ marginBottom: `${sizeCqw(16)}cqw` }}>
                <div className="font-semibold" style={{ fontSize: `${sizeCqw(22)}cqw`, color: '#4886B1', marginBottom: `${sizeCqw(8)}cqw` }}>
                  📝 Live Form State
                </div>
                <pre
                  style={{
                    fontSize: `${sizeCqw(17)}cqw`,
                    background: 'rgba(0,0,0,0.4)',
                    padding: `${sizeCqw(14)}cqw`,
                    borderRadius: `${sizeCqw(8)}cqw`,
                    overflow: 'auto',
                    maxHeight: `${sizeCqw(300)}cqw`,
                    lineHeight: 1.5,
                    color: '#a5f3fc',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(formData, null, 2) || '{}'}
                </pre>
              </div>
            )}

            {/* Validation Errors Inspector */}
            {Object.keys(formErrors).length > 0 && (
              <div style={{ marginBottom: `${sizeCqw(16)}cqw` }}>
                <div className="font-semibold" style={{ fontSize: `${sizeCqw(22)}cqw`, color: '#FA353A', marginBottom: `${sizeCqw(8)}cqw` }}>
                  ⚠️ Validation Errors
                </div>
                <pre
                  style={{
                    fontSize: `${sizeCqw(17)}cqw`,
                    background: 'rgba(250, 53, 58, 0.1)',
                    border: '1px solid rgba(250, 53, 58, 0.3)',
                    padding: `${sizeCqw(14)}cqw`,
                    borderRadius: `${sizeCqw(8)}cqw`,
                    overflow: 'auto',
                    maxHeight: `${sizeCqw(200)}cqw`,
                    lineHeight: 1.5,
                    color: '#fca5a5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(formErrors, null, 2)}
                </pre>
              </div>
            )}

            {/* Card Data Inspector */}
            <div style={{ marginBottom: `${sizeCqw(10)}cqw` }}>
              <div className="font-semibold" style={{ fontSize: `${sizeCqw(22)}cqw`, color: '#4886B1', marginBottom: `${sizeCqw(8)}cqw` }}>
                💾 Card Data (API)
              </div>
              <pre
                style={{
                  fontSize: `${sizeCqw(16)}cqw`,
                  background: 'rgba(0,0,0,0.4)',
                  padding: `${sizeCqw(14)}cqw`,
                  borderRadius: `${sizeCqw(8)}cqw`,
                  overflow: 'auto',
                  maxHeight: `${sizeCqw(280)}cqw`,
                  lineHeight: 1.5,
                  color: '#d4d4d8',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(cardData, null, 2) || '{}'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
