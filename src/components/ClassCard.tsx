import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
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

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer border-border/50" 
      onClick={() => navigate(`/class/${id}`)}
    >
      <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/30">
            <h3 className="text-xl font-serif font-medium text-center px-6 text-foreground/90">
              {title}
            </h3>
          </div>
        )}
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif font-medium text-xl leading-tight">{title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback className="text-xs bg-muted">{hostName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground/80">{hostName}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(date), "MMM d")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{currentParticipants}/{maxParticipants}</span>
          </div>
        </div>

        <div className="text-sm font-medium pt-2">
          {costCredits} credits
        </div>
      </CardContent>
    </Card>
  );
};
