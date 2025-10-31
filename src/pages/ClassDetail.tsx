import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Coins, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface ClassDetail {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  city: string;
  country: string;
  address: string;
  date: string;
  time: string;
  duration: number;
  cost_credits: number;
  max_participants: number;
  category: string;
  host_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  bookings: Array<{
    id: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    };
  }>;
}

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<any>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      }
    });

    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          profiles:host_id (full_name, avatar_url, bio),
          bookings (
            id,
            user_id,
            profiles:user_id (full_name, avatar_url)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setClassData(data);

      // Check if current user has booked
      if (user) {
        const userBooking = data.bookings.find((b: any) => b.user_id === user.id);
        setIsBooked(!!userBooking);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast({
        title: "Error",
        description: "Failed to load class details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async (userId: string) => {
    const { data } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();
    setUserCredits(data);
  };

  const handleBookClass = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in or sign up to book this class",
      });
      navigate("/auth");
      return;
    }

    if (!classData) return;

    const totalCredits =
      (userCredits?.topped_up_balance || 0) + (userCredits?.teaching_balance || 0);

    if (totalCredits < classData.cost_credits) {
      toast({
        title: "Insufficient credits",
        description: `You need ${classData.cost_credits} credits to book this class. Top up now?`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          class_id: classData.id,
          user_id: user.id,
        });

      if (bookingError) throw bookingError;

      // Deduct credits (prioritize teaching credits)
      const teachingToUse = Math.min(
        userCredits.teaching_balance,
        classData.cost_credits
      );
      const toppedUpToUse = classData.cost_credits - teachingToUse;

      const { error: creditsError } = await supabase
        .from("credits")
        .update({
          teaching_balance: userCredits.teaching_balance - teachingToUse,
          topped_up_balance: userCredits.topped_up_balance - toppedUpToUse,
        })
        .eq("user_id", user.id);

      if (creditsError) throw creditsError;

      // Record transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        type: "booking",
        amount: -classData.cost_credits,
        class_id: classData.id,
      });

      toast({
        title: "Yay! You're in! 🎉",
        description: "Your booking is confirmed. Check your email for details.",
      });

      fetchClassDetails();
      fetchUserCredits(user.id);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Class not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="aspect-[21/9] rounded-lg overflow-hidden mb-12 bg-muted/30 border border-border/50">
          {classData.thumbnail_url ? (
            <img
              src={classData.thumbnail_url}
              alt={classData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/20">
              <h1 className="text-5xl font-serif font-medium text-center px-8">{classData.title}</h1>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-serif font-medium">{classData.title}</h1>
                <Badge variant="outline" className="text-xs">{classData.category}</Badge>
              </div>
              <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {classData.description}
              </p>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-serif font-medium mb-4">About Your Host</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={classData.profiles.avatar_url || undefined} />
                    <AvatarFallback className="text-lg bg-muted">
                      {classData.profiles.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-serif font-medium text-lg">{classData.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {classData.profiles.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user && isBooked && (
              <>
                <Card className="bg-muted/20 border-border/50">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-serif font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Exact Address
                    </h2>
                    <p className="text-foreground/80">{classData.address}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Who's Joining ({classData.bookings.length}/{classData.max_participants})
                    </h2>
                    <div className="space-y-3">
                      {classData.bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.profiles.avatar_url || undefined} />
                            <AvatarFallback>
                              {booking.profiles.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{booking.profiles.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!user && (
              <Card className="bg-muted/20 border-border/50">
                <CardContent className="p-6 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Log in to see the exact address and who's joining
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50">
              <CardContent className="p-6 space-y-6">
                <div className="text-3xl font-serif font-medium">
                  {classData.cost_credits} credits
                </div>

                <div className="space-y-3 text-sm border-t border-border/50 pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80">
                      {format(parseISO(classData.date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80">
                      {classData.time} ({classData.duration} hours)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80">
                      {classData.city}, {classData.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80">
                      {classData.bookings.length}/{classData.max_participants} spots filled
                    </span>
                  </div>
                </div>

                {isBooked ? (
                  <div className="bg-accent/30 rounded-lg p-4 text-center border border-border/50">
                    <p className="font-medium text-foreground">You're booked ✓</p>
                  </div>
                ) : (
                  <Button
                    onClick={handleBookClass}
                    className="w-full"
                    size="lg"
                    disabled={classData.bookings.length >= classData.max_participants}
                  >
                    {classData.bookings.length >= classData.max_participants
                      ? "Class Full"
                      : `Book This Class`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
