import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

export function ValueProposition() {
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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div className="space-y-6">
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Join 60-minute, peer-led sessions with up to 7 people. Learn directly, ask freely, and walk away with something you can actually use.
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
          <img 
            src="/value-prop-image.jpg" 
            alt="Peer-led learning sessions" 
            className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105"
          />
        </div>
      </div>

      <div className="border-t border-border/50 pt-8">
        <blockquote className="text-lg sm:text-xl font-serif italic text-foreground text-center max-w-2xl mx-auto">
          "This is the first time I actually understood something in one hour."
          <footer className="mt-4 text-base font-sans not-italic text-muted-foreground">
            — Placeholder Name, Attended: Notion Basics
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

