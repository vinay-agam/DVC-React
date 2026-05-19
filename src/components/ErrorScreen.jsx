/**
 * ErrorScreen
 * ─────────────────────────────────────────────────────────
 * Displayed when the card data cannot be loaded.
 */
export default function ErrorScreen({ message }) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-[#01294c]">
      <div className="flex flex-col items-center gap-4 animate-fade-in text-center px-8">
        <div className="text-5xl">😕</div>
        <h2 className="text-white text-xl font-semibold">Card Not Found</h2>
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          {message || 'We couldn\'t load this digital visiting card. Please check the link and try again.'}
        </p>
      </div>
    </div>
  );
}
