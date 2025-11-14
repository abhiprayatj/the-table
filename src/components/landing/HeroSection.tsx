import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroSectionProps {
  onBrowseClassesClick: () => void;
}

export function HeroSection({ onBrowseClassesClick }: HeroSectionProps) {
  return (
    <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-3xl mx-auto text-center z-10">
        <h1 className="text-5xl sm:text-6xl font-serif font-medium mb-8 text-white leading-tight lg:text-7xl">
          Learn offline. Leave with something real.
        </h1>

        <Button
          size="default"
          onClick={onBrowseClassesClick}
          className="rounded-full text-sm px-6 py-3 h-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Browse Classes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

