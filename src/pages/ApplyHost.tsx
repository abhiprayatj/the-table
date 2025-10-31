import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { z } from "zod";

const hostApplicationSchema = z.object({
  why_host: z.string().min(50, "Please provide at least 50 characters"),
  topics: z.string().min(30, "Please provide at least 30 characters"),
  experience: z.string().optional(),
});

const ApplyHost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    why_host: "",
    topics: "",
    experience: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: existingApp } = await supabase
      .from("host_applications")
      .select("status")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingApp && existingApp.status === "pending") {
      toast({
        title: "Application Already Submitted",
        description: "You have a pending host application under review.",
      });
      navigate("/profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = hostApplicationSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("host_applications").insert({
        user_id: user.id,
        why_host: formData.why_host,
        topics: formData.topics,
        experience: formData.experience || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your host application is now under review. We'll notify you once it's processed.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl mb-4 text-foreground">Apply to Host</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Share your skills and passion with the CommonFolk community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="why_host" className="text-base">
                Why do you want to host classes? *
              </Label>
              <Textarea
                id="why_host"
                value={formData.why_host}
                onChange={(e) =>
                  setFormData({ ...formData, why_host: e.target.value })
                }
                placeholder="Tell us about your motivation to share knowledge..."
                className="min-h-[120px]"
                required
              />
              {errors.why_host && (
                <p className="text-sm text-destructive">{errors.why_host}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.why_host.length}/50 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics" className="text-base">
                What skills or topics would you like to teach? *
              </Label>
              <Textarea
                id="topics"
                value={formData.topics}
                onChange={(e) =>
                  setFormData({ ...formData, topics: e.target.value })
                }
                placeholder="E.g., Pottery, Coding, Cooking, Photography..."
                className="min-h-[120px]"
                required
              />
              {errors.topics && (
                <p className="text-sm text-destructive">{errors.topics}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.topics.length}/30 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-base">
                Any relevant experience or background? (Optional)
              </Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="Share your background, certifications, or teaching experience..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyHost;
