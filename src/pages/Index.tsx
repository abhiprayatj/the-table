import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ClassCard } from "@/components/ClassCard";
import Footer from "@/components/Footer";
import { isAfter, startOfDay, parseISO } from "date-fns";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { UserJourney } from "@/components/landing/UserJourney";
import { CreditsSection } from "@/components/landing/CreditsSection";
import { LearningInterestForm } from "@/components/landing/LearningInterestForm";
import { ReviewsSection } from "@/components/landing/ReviewsSection";

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          profiles:host_id (full_name, avatar_url),
          bookings (id)
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      
      // Filter only upcoming classes
      const today = startOfDay(new Date());
      const upcomingClasses = (data || []).filter(classItem => {
        const classDate = parseISO(classItem.date);
        const classDateTime = new Date(`${classItem.date}T${classItem.time}`);
        return isAfter(classDateTime, new Date());
      });
      
      setClasses(upcomingClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToClasses = () => {
    classesRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Get first 6 classes for horizontal scroll
  const displayedClasses = classes.slice(0, 6);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Section 1: Hero */}
      <HeroSection onBrowseClassesClick={scrollToClasses} />

      {/* Section 2: Value Proposition */}
      <ValueProposition />

      {/* Section 3: User Journey */}
      <UserJourney />

      {/* Section 4: Credits */}
      <CreditsSection />

      {/* Section 5: Learning Interest Form */}
      <LearningInterestForm />

      {/* Section 6: Current Classes */}
      <section ref={classesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground">
            Current Classes
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate("/classes")}
            className="text-sm"
          >
            View All Classes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        ) : displayedClasses.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2 text-lg">No upcoming classes available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex gap-4 min-w-max sm:min-w-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {displayedClasses.map((classItem) => (
                <div key={classItem.id} className="w-[280px] sm:w-auto flex-shrink-0 sm:flex-shrink">
                  <ClassCard
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
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 7: Reviews */}
      <ReviewsSection />

      <Footer onBrowseClassesClick={scrollToClasses} />
    </div>
  );
}
