import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface LogisticsCardProps {
  date: string;
  time: string;
  duration: number;
  location: string;
  address: string;
  seatsRemaining: number;
  maxParticipants: number;
  isBooked: boolean;
  user: any;
}

export function LogisticsCard({
  date,
  time,
  duration,
  location,
  address,
  seatsRemaining,
  maxParticipants,
  isBooked,
  user,
}: LogisticsCardProps) {
  const isFull = seatsRemaining === 0;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif font-medium mb-6">
          Session Logistics
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-foreground font-medium">
                {format(parseISO(date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-foreground font-medium">
                {time} ({duration} {duration === 1 ? 'hour' : 'hours'})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-foreground font-medium">{location}</p>
              {user && isBooked && (
                <p className="text-sm text-muted-foreground mt-1">{address}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="text-foreground font-medium">
                {isFull ? (
                  "This class is full"
                ) : (
                  `${seatsRemaining} ${seatsRemaining === 1 ? 'seat' : 'seats'} left`
                )}
              </p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="mt-6 pt-6 border-t border-border/50 flex items-start gap-3">
            <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Log in to see the exact address
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

