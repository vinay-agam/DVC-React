/**
 * LoadingScreen
 * ─────────────────────────────────────────────────────────
 * Full-screen loading state while card data is being fetched.
 */
export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-[#01294c]">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div className="loader-spinner" />
        <p className="text-white/70 text-sm tracking-wide font-light">
          Loading your digital card...
        </p>
      </div>
    </div>
  );
}
