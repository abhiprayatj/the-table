import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/class/${id}`)}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <h3 className="text-xl font-semibold text-center px-4">{title}</h3>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback className="text-xs">{hostName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{hostName}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{city}, {country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(date), "MMM d")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}h</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Coins className="h-4 w-4 text-primary" />
              <span>{costCredits} credits</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{currentParticipants}/{maxParticipants}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={(e) => {
            e.stopPropagation();
            navigate(`/class/${id}`);
          }}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
