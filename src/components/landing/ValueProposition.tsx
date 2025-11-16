import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { SparkImage } from "@/components/ui/spark-image";

interface ValuePropositionProps {
  onBrowseClassesClick?: () => void;
}

export function ValueProposition({ onBrowseClassesClick }: ValuePropositionProps) {
  const navigate = useNavigate();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate tilt (max 8 degrees)
    const rotateY = (mouseX / (rect.width / 2)) * 8;
    const rotateX = -(mouseY / (rect.height / 2)) * 8;
    
    setTilt({ rotateX, rotateY });
  }

  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0 });
  }

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Join 60-minute, offline sessions with up to 7 people. Learn directly, ask freely, and walk away with something you can actually use.
            </p>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="rounded-full"
              size="lg"
            >
              Sign Up
            </Button>
          </div>
          <div
            ref={imageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="aspect-[4/3] rounded-lg overflow-hidden border border-border/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-black/20"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <SparkImage
              src="/value-prop-image.jpg"
              alt="Peer-led learning sessions"
              className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105"
            />
          </div>
        </div>
      </section>

      <div 
        className="w-full py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center text-center space-y-6"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white max-w-3xl">
          We take you from 0 to 1, so you can go from 1 to 1000.
        </h2>
        <Button
          onClick={onBrowseClassesClick}
          className="bg-white text-[#1a1a1a] hover:bg-white/90 rounded-full"
          size="lg"
        >
          Browse Classes
        </Button>
      </div>
    </>
  );
}

