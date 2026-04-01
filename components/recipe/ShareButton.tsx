"use client";

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
      style={{
        fontFamily: "var(--font-display)",
        color: "rgba(35,33,32,0.5)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
        <circle cx="8" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="2" cy="5" r="1.5" stroke="currentColor" strokeWidth="1" />
        <line x1="3.4" y1="4.3" x2="6.6" y2="2.7" stroke="currentColor" strokeWidth="1" />
        <line x1="3.4" y1="5.7" x2="6.6" y2="7.3" stroke="currentColor" strokeWidth="1" />
      </svg>
      Share
    </button>
  );
}
