import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

interface BookingSidebarProps {
  price: number;
  seatsRemaining: number;
  isBooked: boolean;
  isHost: boolean;
  onBookClick: () => void;
  userCredits: any;
}

export function BookingSidebar({
  price,
  seatsRemaining,
  isBooked,
  isHost,
  onBookClick,
  userCredits,
}: BookingSidebarProps) {
  const isFull = seatsRemaining === 0;
  const totalCredits = (userCredits?.topped_up_balance || 0) + (userCredits?.teaching_balance || 0);

  return (
    <Card className="sticky top-24 border-border/50 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="text-3xl font-serif font-medium flex items-center gap-2">
          <Coins className="h-6 w-6" />
          {price} credits
        </div>

        {userCredits && (
          <div className="text-sm text-muted-foreground">
            Your balance: <span className="font-medium text-foreground">{totalCredits} credits</span>
          </div>
        )}

        {isBooked ? (
          <div className="bg-accent/30 rounded-lg p-4 text-center border border-border/50">
            <p className="font-medium text-foreground">You're booked ✓</p>
          </div>
        ) : isHost ? (
          <div className="bg-muted/30 rounded-lg p-4 text-center border border-border/50">
            <p className="font-medium text-muted-foreground">You're hosting this class</p>
          </div>
        ) : (
          <Button 
            onClick={onBookClick} 
            className="w-full" 
            size="lg" 
            disabled={isFull}
          >
            {isFull ? "Class Full" : `Book for ${price} credits`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

