import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

interface ClassHeroProps {
  title: string;
  hostName: string;
  price: number;
  seatsRemaining: number;
  thumbnailUrl: string | null;
  onBookClick: () => void;
  isBooked: boolean;
  isHost: boolean;
}

export function ClassHero({
  title,
  hostName,
  price,
  seatsRemaining,
  thumbnailUrl,
  onBookClick,
  isBooked,
  isHost,
}: ClassHeroProps) {
  const isFull = seatsRemaining === 0;

  return (
    <div className="space-y-6">
      {/* Title and Meta */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight">
          {title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-lg text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{hostName}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-muted-foreground" />
            <span className="text-xl font-serif font-medium">{price} credits</span>
          </div>
          
          {!isFull && (
            <Badge variant="outline" className="text-sm">
              {seatsRemaining} {seatsRemaining === 1 ? 'seat' : 'seats'} left
            </Badge>
          )}
          
          {isFull && (
            <Badge variant="destructive" className="text-sm">
              Class Full
            </Badge>
          )}
        </div>

        {/* CTA Button */}
        {!isBooked && !isHost && (
          <div className="pt-2">
            {isFull ? (
              <Button size="lg" disabled className="w-full sm:w-auto">
                Class Full
              </Button>
            ) : (
              <Button size="lg" onClick={onBookClick} className="w-full sm:w-auto">
                Book This Class
              </Button>
            )}
          </div>
        )}
        
        {isBooked && (
          <div className="pt-2">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              You're booked ✓
            </Badge>
          </div>
        )}
        
        {isHost && (
          <div className="pt-2">
            <Badge variant="outline" className="text-sm px-4 py-2">
              You're hosting this class
            </Badge>
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="rounded-lg overflow-hidden bg-muted/30 border border-border/50 shadow-sm">
        {thumbnailUrl ? (
          <div className="aspect-[21/9] w-full relative">
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image failed to load:", thumbnailUrl);
                // Fallback: hide broken image and show placeholder
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-accent/20">
                      <h2 class="text-3xl md:text-4xl font-serif font-medium text-center px-8 text-muted-foreground">
                        ${title}
                      </h2>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="aspect-[21/9] w-full flex items-center justify-center bg-accent/20">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-center px-8 text-muted-foreground">
              {title}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

