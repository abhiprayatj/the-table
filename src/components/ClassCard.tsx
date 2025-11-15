/**
 * ClassCard Component - Redesigned for better hierarchy and interactivity
 * 
 * Changes:
 * - Increased title size (text-xl) and weight (font-semibold) for better hierarchy
 * - Moved credits badge to top-right corner of image with icon
 * - Added primary CTA button ("Join Session") at bottom of card
 * - Enhanced hover states: lift effect, shadow, border color change, image zoom
 * - Reduced image aspect ratio from 16/9 to 3/2 to minimize empty space
 * - Reorganized metadata with clear hierarchy: location (primary), date/duration (secondary), spots (with visual indicators)
 * - Enhanced instructor block with larger avatar and better spacing
 * - Improved overall spacing and padding throughout
 * - Entire card is clickable; button click uses stopPropagation to prevent double navigation
 */
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ClassCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  hostName: string;
  hostAvatar?: string;
  city: string;
  country: string;
  date: string;
  time: string;
  duration: number;
  costCredits: number;
  currentParticipants: number;
  maxParticipants: number;
  category: string;
}

export const ClassCard = ({
  id,
  title,
  description,
  thumbnailUrl,
  hostName,
  hostAvatar,
  city,
  country,
  date,
  time,
  duration,
  costCredits,
  currentParticipants,
  maxParticipants,
  category,
}: ClassCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/class/${id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/class/${id}`);
  };

  const remainingSpots = maxParticipants - currentParticipants;
  const isAlmostFull = remainingSpots <= 2;
  const isFull = remainingSpots === 0;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 cursor-pointer border-border/50 group flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Image area with credits badge overlay */}
      <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/40 to-muted/30">
            <h3 className="text-xs font-serif font-medium text-center px-3 text-foreground/70">
              {title}
            </h3>
          </div>
        )}
        {/* Credits badge in top-right */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary shadow-md flex items-center gap-1 text-xs px-2 py-0.5">
            <Coins className="h-3 w-3" />
            {costCredits}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-sans font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors mb-2">
          {title}
        </h3>

        {/* Category tag underneath title */}
        <Badge variant="outline" className="w-fit text-xs font-normal mb-2">
          {category}
        </Badge>

        {/* Price underneath tags */}
        <div className="flex items-center gap-1.5 mb-3">
          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{costCredits} credits</span>
        </div>

        {/* Instructor block */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6 border border-border">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback className="text-xs bg-muted font-medium">
              {hostName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground/90">{hostName}</span>
        </div>

        {/* Metadata with clear hierarchy */}
        <div className="space-y-1.5 pt-2 border-t border-border/50 mb-3">
          {/* Primary: Location */}
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground/80">{city}</span>
          </div>
          
          {/* Secondary: Date, Time, Duration */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(date), "MMM d")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
            <div className="text-muted-foreground">
              <span>{duration}h</span>
            </div>
          </div>

          {/* Remaining spots with visual indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <Users className={`h-3 w-3 shrink-0 ${isFull ? 'text-destructive' : isAlmostFull ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <span className={isFull ? 'text-destructive font-medium' : isAlmostFull ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
              {isFull ? 'Full' : `${remainingSpots} spot${remainingSpots !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>

        {/* Primary CTA - pushed to bottom with mt-auto */}
        <Button 
          onClick={handleButtonClick}
          className="w-full mt-auto"
          size="sm"
          disabled={isFull}
        >
          {isFull ? 'Session Full' : 'Join Session'}
        </Button>
      </CardContent>
    </Card>
  );
};
