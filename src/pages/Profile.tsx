import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Calendar, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [hostedClasses, setHostedClasses] = useState<any[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchProfileData(session.user.id);
  };

  const fetchProfileData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      // Fetch credits
      const { data: creditsData } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      setCredits(creditsData);

      // Fetch hosted classes if user is a verified host
      if (profileData?.host_verified) {
        const { data: hosted } = await supabase
          .from("classes")
          .select(`
            *,
            bookings (id)
          `)
          .eq("host_id", userId)
          .order("date", { ascending: true });

        setHostedClasses(hosted || []);
      }

      // Fetch joined classes
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`
          *,
          classes (
            *,
            profiles:host_id (full_name, avatar_url)
          )
        `)
        .eq("user_id", userId);

      setJoinedClasses(bookings?.map(b => b.classes) || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = () => {
    const amount = prompt("How much would you like to top up? (£2 = 1 credit)");
    if (!amount) return;

    const pounds = parseFloat(amount);
    if (isNaN(pounds) || pounds < 2) {
      toast({
        title: "Invalid amount",
        description: "Minimum top-up is £2",
        variant: "destructive",
      });
      return;
    }

    const creditsToAdd = Math.floor(pounds / 2);
    
    supabase
      .from("credits")
      .update({
        topped_up_balance: (credits?.topped_up_balance || 0) + creditsToAdd,
      })
      .eq("user_id", profile.id)
      .then(() => {
        supabase
          .from("credit_transactions")
          .insert({
            user_id: profile.id,
            type: "top_up",
            amount: creditsToAdd,
          })
          .then(() => {
            toast({
              title: "Credits added! 💜",
              description: `You topped up ${creditsToAdd} credits`,
            });
            fetchProfileData(profile.id);
          });
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-8 border-border/50">
          <CardContent className="pt-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-xl bg-muted">
                  {profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-serif font-medium">{profile?.full_name}</h1>
                  {profile?.host_verified && (
                    <Badge variant="secondary" className="bg-accent/50">
                      Verified Host
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2 text-sm">
                  {profile?.city}, {profile?.country}
                </p>
                {profile?.bio && (
                  <p className="text-sm mt-3 text-foreground/80 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-medium">
                <Coins className="h-5 w-5" />
                Your Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--topped-up-credit))]" />
                  <span className="font-medium text-sm">Topped Up</span>
                </div>
                <span className="text-2xl font-serif font-medium">{credits?.topped_up_balance || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--teaching-credit))]" />
                  <span className="font-medium text-sm">Teaching</span>
                </div>
                <span className="text-2xl font-serif font-medium">{credits?.teaching_balance || 0}</span>
              </div>

              <Button onClick={handleTopUp} className="w-full" size="lg">
                Top Up Credits
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.host_verified ? (
                <Button
                  onClick={() => navigate("/create-class")}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Host a Session
                </Button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to teach? Apply to become a verified host!
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Apply to Host (Coming Soon)
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Browse Classes
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <Tabs defaultValue="joined">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                <TabsTrigger value="joined">Classes I've Joined</TabsTrigger>
                {profile?.host_verified && (
                  <TabsTrigger value="hosted">Classes I've Hosted</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="joined" className="mt-6">
                {joinedClasses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't joined any classes yet.</p>
                    <Button
                      variant="link"
                      onClick={() => navigate("/")}
                      className="mt-2"
                    >
                      Explore classes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinedClasses.map((classItem: any) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => navigate(`/class/${classItem.id}`)}
                      >
                        <div>
                          <h3 className="font-serif font-medium">{classItem.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(parseISO(classItem.date), "MMM d, yyyy")} • {classItem.profiles.full_name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{classItem.category}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {profile?.host_verified && (
                <TabsContent value="hosted" className="mt-6">
                  {hostedClasses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't hosted any classes yet.</p>
                      <Button
                        variant="link"
                        onClick={() => navigate("/create-class")}
                        className="mt-2"
                      >
                        Create your first class
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hostedClasses.map((classItem: any) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => navigate(`/class/${classItem.id}`)}
                      >
                        <div>
                          <h3 className="font-serif font-medium">{classItem.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(parseISO(classItem.date), "MMM d, yyyy")} • {classItem.bookings.length}/{classItem.max_participants} spots
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{classItem.category}</Badge>
                      </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
