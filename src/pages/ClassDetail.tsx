import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Users, Coins, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ClassHero } from "@/components/class-detail/ClassHero";
import { OutcomeSection } from "@/components/class-detail/OutcomeSection";
import { PrerequisitesSection } from "@/components/class-detail/PrerequisitesSection";
import { WhatToBringSection } from "@/components/class-detail/WhatToBringSection";
import { LogisticsCard } from "@/components/class-detail/LogisticsCard";
import { FullDescription } from "@/components/class-detail/FullDescription";
import { BookingSidebar } from "@/components/class-detail/BookingSidebar";
import { StickyBookingBar } from "@/components/class-detail/StickyBookingBar";
interface ClassDetail {
  id: string;
  title: string;
  description: string;
  who_for: string | null;
  prerequisites: string | null;
  walk_away_with: string | null;
  what_to_bring: string | null;
  thumbnail_url: string | null;
  photo_urls: string[] | null;
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
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<any>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    fetchClassDetails();
  }, [id, user]);
  const fetchClassDetails = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("classes").select(`
          *,
          profiles:host_id (full_name, avatar_url, bio),
          bookings (
            id,
            user_id,
            profiles:user_id (full_name, avatar_url)
          )
        `).eq("id", id).single();
      if (error) throw error;
      setClassData(data);

      // Check if current user has booked
      if (user) {
        const userBooking = data.bookings.find((b: any) => b.user_id === user.id);
        setIsBooked(!!userBooking);
      } else {
        setIsBooked(false);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast({
        title: "Error",
        description: "Failed to load class details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchUserCredits = async (userId: string) => {
    const {
      data
    } = await supabase.from("credits").select("*").eq("user_id", userId).single();
    setUserCredits(data);
  };
  const handleBookClick = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in or sign up to book this class"
      });
      navigate("/auth");
      return;
    }
    if (!classData) return;
    
    // Check if user is the host
    if (user.id === classData.host_id) {
      toast({
        title: "Cannot book your own class",
        description: "You are the host of this class and cannot book it.",
        variant: "destructive"
      });
      return;
    }
    
    const totalCredits = (userCredits?.topped_up_balance || 0) + (userCredits?.teaching_balance || 0);
    if (totalCredits < classData.cost_credits) {
      toast({
        title: "Insufficient credits",
        description: `You need ${classData.cost_credits} credits to book this class. Top up now?`,
        variant: "destructive"
      });
      return;
    }
    if (classData.bookings.length >= classData.max_participants) {
      toast({
        title: "Class full",
        description: "This class is already full.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!user || !classData) return;
    
    // Safety check: prevent host from booking their own class
    if (user.id === classData.host_id) {
      toast({
        title: "Cannot book your own class",
        description: "You are the host of this class and cannot book it.",
        variant: "destructive"
      });
      setShowConfirmDialog(false);
      return;
    }
    
    // Re-check availability and credits before booking
    const totalCredits = (userCredits?.topped_up_balance || 0) + (userCredits?.teaching_balance || 0);
    if (totalCredits < classData.cost_credits) {
      toast({
        title: "Insufficient credits",
        description: `You need ${classData.cost_credits} credits to book this class. Top up now?`,
        variant: "destructive"
      });
      setShowConfirmDialog(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Create booking
      const {
        error: bookingError
      } = await supabase.from("bookings").insert({
        class_id: classData.id,
        user_id: user.id
      });
      if (bookingError) throw bookingError;

      // Deduct credits (prioritize teaching credits)
      const teachingToUse = Math.min(userCredits.teaching_balance || 0, classData.cost_credits);
      const toppedUpToUse = classData.cost_credits - teachingToUse;
      const {
        error: creditsError
      } = await supabase.from("credits").update({
        teaching_balance: (userCredits.teaching_balance || 0) - teachingToUse,
        topped_up_balance: (userCredits.topped_up_balance || 0) - toppedUpToUse
      }).eq("user_id", user.id);
      if (creditsError) throw creditsError;

      // Record transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        type: "booking",
        amount: -classData.cost_credits,
        class_id: classData.id
      });
      
      setShowConfirmDialog(false);
      toast({
        title: "Yay! You're in! 🎉",
        description: "Your booking is confirmed. Check your email for details."
      });
      fetchClassDetails();
      fetchUserCredits(user.id);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!classData) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Class not found</p>
        </div>
      </div>;
  }
  const seatsRemaining = classData.max_participants - classData.bookings.length;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <ClassHero
          title={classData.title}
          hostName={classData.profiles.full_name}
          price={classData.cost_credits}
          seatsRemaining={seatsRemaining}
          thumbnailUrl={classData.thumbnail_url}
          onBookClick={handleBookClick}
          isBooked={isBooked}
          isHost={user?.id === classData.host_id}
        />

        {/* Content Sections */}
        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Outcome Section */}
            <OutcomeSection content={classData.walk_away_with} />

            {/* Prerequisites Section */}
            <PrerequisitesSection content={classData.prerequisites} />

            {/* What to Bring Section */}
            <WhatToBringSection content={classData.what_to_bring} />

            {/* Logistics Card */}
            <LogisticsCard
              date={classData.date}
              time={classData.time}
              duration={classData.duration}
              location={`${classData.city}, ${classData.country}`}
              address={classData.address}
              seatsRemaining={seatsRemaining}
              maxParticipants={classData.max_participants}
              isBooked={isBooked}
              user={user}
            />

            {/* Full Description */}
            <FullDescription content={classData.description} />

            {/* Who For Section (if exists) */}
            {classData.who_for && (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-medium mb-4">
                    Who The Class is For
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {classData.who_for}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Photos Section */}
            {classData.photo_urls && classData.photo_urls.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-medium mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {classData.photo_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`${classData.title} - Photo ${idx + 1}`}
                        className="rounded-lg object-cover h-48 w-full border border-border/50"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Host Info */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-serif font-medium mb-4">About Your Host</h2>
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

            {/* Address & Participants (if booked) */}
            {user && isBooked && (
              <>
                <Card className="bg-muted/20 border-border/50 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-serif font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Exact Address
                    </h2>
                    <p className="text-foreground/80">{classData.address}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
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
          </div>

          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <BookingSidebar
              price={classData.cost_credits}
              seatsRemaining={seatsRemaining}
              isBooked={isBooked}
              isHost={user?.id === classData.host_id}
              onBookClick={handleBookClick}
              userCredits={userCredits}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <StickyBookingBar
        price={classData.cost_credits}
        seatsRemaining={seatsRemaining}
        isBooked={isBooked}
        isHost={user?.id === classData.host_id}
        onBookClick={handleBookClick}
        className="lg:hidden"
      />

      <AlertDialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          if (!isProcessing) {
            setShowConfirmDialog(open);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to book this class. Please review the details below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {classData && (
            <div className="space-y-4 py-4">
              {/* Class Summary */}
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="font-serif font-medium text-lg">{classData.title}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(parseISO(classData.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{classData.time} ({classData.duration} hours)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{classData.city}, {classData.country}</span>
                  </div>
                </div>
              </div>

              {/* Credit Breakdown */}
              {userCredits && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Credits Breakdown</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total to deduct:</span>
                      <span className="font-medium">{classData.cost_credits} credits</span>
                    </div>
                    
                    <div className="border-t border-border/50 pt-2 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current balance:</span>
                        <span className="font-medium">
                          {(userCredits.topped_up_balance || 0) + (userCredits.teaching_balance || 0)} credits
                        </span>
                      </div>
                      <div className="pl-4 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>• Teaching credits:</span>
                          <span>{userCredits.teaching_balance || 0} credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Topped up credits:</span>
                          <span>{userCredits.topped_up_balance || 0} credits</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Remaining after:</span>
                        <span className="font-medium text-primary">
                          {((userCredits.topped_up_balance || 0) + (userCredits.teaching_balance || 0)) - classData.cost_credits} credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBooking}
              disabled={isProcessing}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}