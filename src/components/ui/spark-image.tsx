import { useEffect, useRef, useState } from "react";

interface SparkImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SparkImage({ src, alt, className }: SparkImageProps) {
  const [showSparks, setShowSparks] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function handleMouseEnter() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSparks(true);
    timeoutRef.current = window.setTimeout(() => {
      setShowSparks(false);
      timeoutRef.current = null;
    }, 600);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full" onMouseEnter={handleMouseEnter}>
      <img src={src} alt={alt} className={className} />
      {showSparks && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <span className="absolute left-[20%] top-[30%] h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[cf-spark-pop_600ms_ease-out_forwards]" />
          <span className="absolute left-[45%] top-[25%] h-2 w-2 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-[cf-spark-pop_600ms_ease-out_forwards] [animation-delay:40ms]" />
          <span className="absolute left-[65%] top-[40%] h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[cf-spark-pop_600ms_ease-out_forwards] [animation-delay:80ms]" />
          <span className="absolute left-[35%] top-[60%] h-1 w-1 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-[cf-spark-pop_600ms_ease-out_forwards] [animation-delay:120ms]" />
          <span className="absolute left-[75%] top-[70%] h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[cf-spark-pop_600ms_ease-out_forwards] [animation-delay:160ms]" />
        </div>
      )}

      <style>
        {`
          @keyframes cf-spark-pop {
            0% {
              opacity: 0;
              transform: scale(0.4) translate3d(0, 0, 0);
            }
            20% {
              opacity: 1;
            }
            60% {
              opacity: 0.9;
              transform: scale(1) translate3d(var(--dx, 6px), var(--dy, -8px), 0);
            }
            100% {
              opacity: 0;
              transform: scale(0.6) translate3d(var(--dx, 12px), var(--dy, -16px), 0);
            }
          }
        `}
      </style>
    </div>
  );
}


