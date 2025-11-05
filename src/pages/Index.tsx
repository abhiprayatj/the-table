import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ClassCard } from "@/components/ClassCard";
import { format, parseISO } from "date-fns";
import { User } from "@supabase/supabase-js";
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

  useEffect(() => {
    fetchClasses();

    // Check auth status
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
      const {
        data,
        error
      } = await supabase.from("classes").select(`
          *,
          profiles:host_id (full_name, avatar_url),
          bookings (id)
        `).order("date", {
        ascending: true
      }).order("time", {
        ascending: true
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
  const classesByDate = classes.reduce((acc, classItem) => {
    const date = classItem.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(classItem);
    return acc;
  }, {} as Record<string, ClassWithHost[]>);
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {!user && (
          <div className="text-center mb-20">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium mb-6 text-foreground leading-tight">Make Learning Human</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-light">Gather with curious folks and learn something around a table</p>
          </div>
        )}

        {loading ? <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div> : Object.keys(classesByDate).length === 0 ? <div className="text-center py-16 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2 text-lg">No classes available yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to host a session.</p>
          </div> : <div className="space-y-16">
            {Object.entries(classesByDate).map(([date, dateClasses]) => <div key={date}>
                <h2 className="text-2xl font-serif font-medium mb-8 text-foreground">
                  {format(parseISO(date), "EEEE, MMMM d")}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dateClasses.map(classItem => <ClassCard key={classItem.id} id={classItem.id} title={classItem.title} description={classItem.description} thumbnailUrl={classItem.thumbnail_url || undefined} hostName={classItem.profiles.full_name} hostAvatar={classItem.profiles.avatar_url || undefined} city={classItem.city} country={classItem.country} date={classItem.date} time={classItem.time} duration={classItem.duration} costCredits={classItem.cost_credits} currentParticipants={classItem.bookings.length} maxParticipants={classItem.max_participants} category={classItem.category} />)}
                </div>
              </div>)}
          </div>}
      </main>
    </div>;
}