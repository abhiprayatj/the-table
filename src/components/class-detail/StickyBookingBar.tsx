import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyBookingBarProps {
  price: number;
  seatsRemaining: number;
  isBooked: boolean;
  isHost: boolean;
  onBookClick: () => void;
  className?: string;
}

export function StickyBookingBar({
  price,
  seatsRemaining,
  isBooked,
  isHost,
  onBookClick,
  className,
}: StickyBookingBarProps) {
  const isFull = seatsRemaining === 0;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-lg z-50 p-4",
        className
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-serif font-medium">{price} credits</span>
          {!isFull && (
            <Badge variant="outline" className="text-xs">
              {seatsRemaining} {seatsRemaining === 1 ? 'seat' : 'seats'} left
            </Badge>
          )}
        </div>

        {isBooked ? (
          <Badge variant="secondary" className="text-sm px-4 py-2">
            You're booked ✓
          </Badge>
        ) : isHost ? (
          <Badge variant="outline" className="text-sm px-4 py-2">
            You're hosting
          </Badge>
        ) : (
          <Button 
            onClick={onBookClick} 
            size="lg" 
            disabled={isFull}
            className="flex-1 sm:flex-none"
          >
            {isFull ? "Class Full" : `Book for ${price} credits`}
          </Button>
        )}
      </div>
    </div>
  );
}

