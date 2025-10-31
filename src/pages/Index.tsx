import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ClassCard } from "@/components/ClassCard";
import { format, parseISO } from "date-fns";

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
  bookings: { id: string }[];
}

export default function Index() {
  const [classes, setClasses] = useState<ClassWithHost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Learn from Your Neighbors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover small, in-person classes taught by people in your community. From cooking to languages, find your next adventure.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        ) : Object.keys(classesByDate).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No classes available yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to host a session!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(classesByDate).map(([date, dateClasses]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="text-2xl font-semibold">
                    📅 {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
