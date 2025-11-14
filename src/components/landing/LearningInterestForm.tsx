import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function LearningInterestForm() {
  const [interest, setInterest] = useState("");
  const [popularInterests, setPopularInterests] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPopularInterests();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const fetchPopularInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_interest")
        .select("interest")
        .limit(100);

      if (error) throw error;

      // Count occurrences and get top 3
      const interestCounts: Record<string, number> = {};
      data?.forEach((item) => {
        interestCounts[item.interest] = (interestCounts[item.interest] || 0) + 1;
      });

      const sorted = Object.entries(interestCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([interest]) => interest);

      setPopularInterests(sorted);
    } catch (error) {
      console.error("Error fetching popular interests:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interest.trim() || interest.length > 30) {
      toast({
        title: "Invalid input",
        description: "Please enter an interest (max 30 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("learning_interest")
        .insert({
          interest: interest.trim(),
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your interest has been recorded.",
      });

      setInterest("");
      fetchPopularInterests();
    } catch (error) {
      console.error("Error submitting interest:", error);
      toast({
        title: "Error",
        description: "Failed to submit interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="bg-muted/30 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-center mb-8 text-foreground">
          What do you want to learn?
        </h2>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="flex gap-3">
            <Input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Type what you'd like to learn..."
              maxLength={30}
              className="flex-1"
            />
            <Button type="submit" className="rounded-full">
              Submit
            </Button>
          </div>

          {popularInterests.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Popular interests:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularInterests.map((popular, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-background border border-border/50 rounded-full text-sm text-foreground"
                  >
                    {popular}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

