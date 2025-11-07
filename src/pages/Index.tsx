import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ClassCard } from "@/components/ClassCard";
import Footer from "@/components/Footer";
import { format, parseISO } from "date-fns";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Ticket, Sparkles, Users, ShieldCheck, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface ClassWithHost {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  city: string;
  country: string;
  date: string;
  time: string;
  duration: number;
  cost_credits: number;
  max_participants: number;
  category: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  bookings: {
    id: string;
  }[];
}
export default function Index() {
  const [classes, setClasses] = useState<ClassWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const classesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchClasses();

    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          profiles:host_id (full_name, avatar_url),
          bookings (id)
        `,
        )
        .order("date", {
          ascending: true,
        })
        .order("time", {
          ascending: true,
        });
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group classes by date
  const classesByDate = classes.reduce(
    (acc, classItem) => {
      const date = classItem.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(classItem);
      return acc;
    },
    {} as Record<string, ClassWithHost[]>,
  );
  const scrollToClasses = () => {
    classesRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {!user && (
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-serif font-medium mb-8 text-foreground leading-tight lg:text-5xl">
              Everyone's got something to share. Learn and connect on{" "}
              <span className="font-bold text-[#f2b955]">the table.</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="default"
                onClick={scrollToClasses}
                className="rounded-full text-sm px-6 py-3 h-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse Classes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="default"
                variant="secondary"
                onClick={() => navigate("/apply-host")}
                className="rounded-full text-sm px-6 py-3 h-auto"
              >
                Host a Class
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-center mb-12 text-foreground">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Discover */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Search className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-xl font-sans font-bold text-foreground">Discover 🔍</h3>
            <p className="text-muted-foreground">Browse classes in your city, from notion to coding</p>
          </div>

          {/* Step 2: Book */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Ticket className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-xl font-sans font-bold text-foreground">Book 🎟️</h3>
            <p className="text-muted-foreground">Reserve your spot for just £10 (5 credits)</p>
          </div>

          {/* Step 3: Learn */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Sparkles className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-xl font-sans font-bold text-foreground">Learn ✨</h3>
            <p className="text-muted-foreground">Show up, connect, and gain a new skill</p>
          </div>
        </div>
      </section>

      {/* Why use the table? Section */}
      <section className="bg-muted/30 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-center mb-12 text-foreground">
            Why use the table?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1: Small Groups */}
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary flex-shrink-0" />
                <h3 className="text-lg font-sans font-bold text-foreground">Small Groups</h3>
              </div>
              <p className="text-muted-foreground">Max 10 people per class. Actually get to know everyone.</p>
            </div>

            {/* Benefit 2: Verified Hosts */}
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
                <h3 className="text-lg font-sans font-bold text-foreground">Verified Hosts</h3>
              </div>
              <p className="text-muted-foreground">All teachers are reviewed and approved by us.</p>
            </div>

            {/* Benefit 3: Earn While Teaching */}
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-primary flex-shrink-0" />
                <h3 className="text-lg font-sans font-bold text-foreground">Earn While Teaching</h3>
              </div>
              <p className="text-muted-foreground">Host a class, build community, earn credits.</p>
            </div>
          </div>
        </div>
      </section>

      <main ref={classesRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        ) : Object.keys(classesByDate).length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2 text-lg">No classes available yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to host a session.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(classesByDate).map(([date, dateClasses]) => (
              <div key={date}>
                <h2 className="text-2xl font-serif font-medium mb-8 text-foreground">
                  {format(parseISO(date), "EEEE, MMMM d")}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {dateClasses.map((classItem) => (
                    <ClassCard
                      key={classItem.id}
                      id={classItem.id}
                      title={classItem.title}
                      description={classItem.description}
                      thumbnailUrl={classItem.thumbnail_url || undefined}
                      hostName={classItem.profiles.full_name}
                      hostAvatar={classItem.profiles.avatar_url || undefined}
                      city={classItem.city}
                      country={classItem.country}
                      date={classItem.date}
                      time={classItem.time}
                      duration={classItem.duration}
                      costCredits={classItem.cost_credits}
                      currentParticipants={classItem.bookings.length}
                      maxParticipants={classItem.max_participants}
                      category={classItem.category}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer onBrowseClassesClick={scrollToClasses} />
    </div>
  );
}
