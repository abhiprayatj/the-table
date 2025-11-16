import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { z } from "zod";

interface ExperienceItem {
  name: string;
  years: string;
}

interface ProofLink {
  label: string;
  url: string;
}

const hostApplicationSchema = z.object({
  bio: z.string().min(30, "Please write at least 2–3 sentences."),
  teachIdeas: z
    .string()
    .min(30, "Please include 2–3 example class ideas with outcomes."),
  experiences: z
    .array(
      z.object({
        name: z.string().min(1, "Experience name is required"),
        years: z.string().regex(/^\d+$/, "Years should be a number").optional(),
      })
    )
    .optional(),
  proofLinks: z
    .array(
      z.object({
        label: z.string().min(1, "Link name is required"),
        url: z.string().url("Please enter a valid URL"),
      })
    )
    .optional(),
});

const ApplyHost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    teachIdeas: "",
    experiences: [] as ExperienceItem[],
    proofLinks: [] as ProofLink[],
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

  function addExperienceRow() {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { name: "", years: "" }],
    }));
  }

  function updateExperienceRow(index: number, key: keyof ExperienceItem, value: string) {
    setFormData((prev) => {
      const next = [...prev.experiences];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, experiences: next };
    });
  }

  function removeExperienceRow(index: number) {
    setFormData((prev) => {
      const next = [...prev.experiences];
      next.splice(index, 1);
      return { ...prev, experiences: next };
    });
  }

  function addLinkRow() {
    setFormData((prev) => ({
      ...prev,
      proofLinks: [...prev.proofLinks, { label: "", url: "" }],
    }));
  }

  function updateLinkRow(index: number, key: keyof ProofLink, value: string) {
    setFormData((prev) => {
      const next = [...prev.proofLinks];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, proofLinks: next };
    });
  }

  function removeLinkRow(index: number) {
    setFormData((prev) => {
      const next = [...prev.proofLinks];
      next.splice(index, 1);
      return { ...prev, proofLinks: next };
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
        bio: formData.bio,
        teach_ideas: formData.teachIdeas,
        experiences: formData.experiences?.length ? formData.experiences : null,
        proof_links: formData.proofLinks?.length ? formData.proofLinks : null,
        status: "pending",
      } as any);

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
          <h1 className="font-serif text-5xl mb-4 text-foreground">Become a verified teacher and start hosting classes</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Share your skills and passion with The Table community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-2">
              <Label htmlFor="bio" className="text-base">
                Tell us a bit about yourself
              </Label>
              <p className="text-sm text-muted-foreground">
                2–3 sentences. What do you do now, and what’s your background?
              </p>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a short bio..."
                className="min-h-[120px]"
                required
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio}</p>
              )}
            </section>

            <section className="space-y-2">
              <Label htmlFor="teachIdeas" className="text-base">
                What could you confidently teach in a 60-minute session?
              </Label>
              <p className="text-sm text-muted-foreground">
                List 2–3 example class ideas. For each, include a title and what people would walk away with.
              </p>
              <Textarea
                id="teachIdeas"
                value={formData.teachIdeas}
                onChange={(e) =>
                  setFormData({ ...formData, teachIdeas: e.target.value })
                }
                placeholder="Example: Intro to DSLR Photography — leave with 3 properly exposed photos and a workflow for shooting in manual."
                className="min-h-[140px]"
                required
              />
              {errors.teachIdeas && (
                <p className="text-sm text-destructive">{errors.teachIdeas}</p>
              )}
            </section>

            <section className="space-y-3">
              <Label className="text-base">Teaching or mentoring experience (optional)</Label>
              {formData.experiences.length > 0 && (
                <div className="space-y-3">
                  {formData.experiences.map((exp, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3">
                      <div className="col-span-8">
                        <Input
                          placeholder="Experience name"
                          value={exp.name}
                          onChange={(e) => updateExperienceRow(idx, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Years"
                          value={exp.years}
                          onChange={(e) => updateExperienceRow(idx, "years", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeExperienceRow(idx)}
                          className="w-full"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Button type="button" variant="outline" onClick={addExperienceRow}>
                  + Add another experience
                </Button>
              </div>
              {errors.experiences && (
                <p className="text-sm text-destructive">{errors.experiences}</p>
              )}
            </section>

            <section className="space-y-2">
              <Label className="text-base">Anything you’d like to show us? (optional)</Label>
              <p className="text-sm text-muted-foreground">
                Portfolio, GitHub, Behance, LinkedIn, blog, etc.
              </p>

              {formData.proofLinks.length > 0 && (
                <div className="space-y-3">
                  {formData.proofLinks.map((link, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <Input
                          placeholder='Link name (e.g., "GitHub", "Portfolio")'
                          value={link.label}
                          onChange={(e) => updateLinkRow(idx, "label", e.target.value)}
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          placeholder="https://example.com"
                          value={link.url}
                          onChange={(e) => updateLinkRow(idx, "url", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeLinkRow(idx)}
                          className="w-full"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Button type="button" variant="outline" onClick={addLinkRow}>
                  + Add another link
                </Button>
              </div>

              {errors.proofLinks && (
                <p className="text-sm text-destructive">{errors.proofLinks}</p>
              )}
            </section>

            <div className="flex gap-4 pt-2">
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
