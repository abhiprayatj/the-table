import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ExperienceItem {
  name: string;
  years?: string;
}

interface ProofLink {
  label: string;
  url: string;
}

interface HostApplication {
  id: string;
  user_id: string;
  bio: string;
  teach_ideas: string;
  experiences: ExperienceItem[] | null;
  proof_links: ProofLink[] | null;
  rejection_feedback: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  profiles: {
    full_name: string;
    email: string;
    city: string;
    country: string;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [rejectionFeedback, setRejectionFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role using the has_role function
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("host_applications")
      .select(
        `
        id,
        user_id,
        bio,
        teach_ideas,
        experiences,
        proof_links,
        rejection_feedback,
        status,
        submitted_at,
        reviewed_at,
        profiles (
          full_name,
          email,
          city,
          country
        )
      `
      )
      .order("submitted_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
      return;
    }

    setApplications(data || []);
  };

  const handleApprove = async (applicationId: string, userId: string) => {
    try {
      // Update application status
      const { error: appError } = await supabase
        .from("host_applications")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Set host_verified to true
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ host_verified: true })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Application Approved",
        description: "The user is now a verified host.",
      });

      await fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    const feedback = (rejectionFeedback[applicationId] || "").trim();
    if (feedback.length < 10) {
      toast({
        title: "Feedback Required",
        description: "Please provide rejection feedback (minimum 10 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("host_applications")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_feedback: feedback,
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "Feedback has been saved.",
      });

      setRejectionFeedback({ ...rejectionFeedback, [applicationId]: "" });
      await fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingApps = applications.filter((app) => app.status === "pending");
  const reviewedApps = applications.filter((app) => app.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <h1 className="font-serif text-5xl mb-8 text-foreground">Admin Dashboard</h1>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Applications ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6 mt-6">
            {pendingApps.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending applications
                </CardContent>
              </Card>
            ) : (
              pendingApps.map((app) => (
                <Card key={app.id} className="border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">
                      {app.profiles.full_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {app.profiles.email} • {app.profiles.city}, {app.profiles.country}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{app.bio}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">What they can teach</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{app.teach_ideas}</p>
                    </div>
                    {app.experiences && app.experiences.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Teaching or mentoring experience</h3>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                          {app.experiences.map((ex, i) => (
                            <li key={i}>
                              {ex.name}
                              {ex.years ? ` — ${ex.years} year${ex.years === "1" ? "" : "s"}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {app.proof_links && app.proof_links.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Proof links</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {app.proof_links.map((lnk, i) => (
                            <li key={i}>
                              <a
                                className="text-primary underline break-all"
                                href={lnk.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {lnk.label || lnk.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() => handleApprove(app.id, app.user_id)}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Rejection feedback (minimum 10 characters)..."
                          value={rejectionFeedback[app.id] || ""}
                          onChange={(e) =>
                            setRejectionFeedback({
                              ...rejectionFeedback,
                              [app.id]: e.target.value,
                            })
                          }
                          className="min-h-[80px]"
                        />
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                          className="w-full"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-6 mt-6">
            {reviewedApps.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No reviewed applications
                </CardContent>
              </Card>
            ) : (
              reviewedApps.map((app) => (
                <Card key={app.id} className="border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl flex items-center justify-between">
                      {app.profiles.full_name}
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Reviewed: {new Date(app.reviewed_at || "").toLocaleDateString()}
                    </p>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

