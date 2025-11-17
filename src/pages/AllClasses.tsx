import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClassCard } from "@/components/ClassCard";
import { format, parseISO } from "date-fns";

const CATEGORIES = [
  "All",
  "Arts & Crafts",
  "Languages",
  "Technology",
  "Writing",
  "Photography",
  "Other",
];

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

function formatDateGroup(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "EEE d MMM");
}

function groupClassesByDate(classes: ClassWithHost[]): Map<string, ClassWithHost[]> {
  const grouped = new Map<string, ClassWithHost[]>();
  
  classes.forEach((classItem) => {
    const dateKey = classItem.date;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(classItem);
  });
  
  return grouped;
}

export default function AllClasses() {
  const [classes, setClasses] = useState<ClassWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  // Filter classes based on search and category
  const filteredClasses = classes.filter((classItem) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = activeCategory === "All" || classItem.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Group filtered classes by date
  const groupedClasses = groupClassesByDate(filteredClasses);
  const sortedDateKeys = Array.from(groupedClasses.keys()).sort();

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-foreground">
            All Classes
          </h1>
          <p className="text-muted-foreground mt-2">Find a class that fits your week.</p>
        </div>

        {/* Search Bar */}
        <div>
          <Input
            type="text"
            placeholder="Search by class or teacher…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap shrink-0"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 space-y-4">
            <h2 className="text-xl font-serif font-medium text-foreground">No classes found</h2>
            <p className="text-muted-foreground">Try adjusting your search or clearing filters.</p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear filters
            </Button>
          </div>
        ) : (
          /* Date-Grouped Class List */
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey} className="space-y-4">
                <h2 className="text-lg font-serif font-medium text-foreground">
                  {formatDateGroup(dateKey)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedClasses.get(dateKey)!.map((classItem) => (
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

