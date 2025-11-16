import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Wallet,
  Users,
  CalendarClock,
  HeartHandshake,
  ShieldCheck,
  FilePlus,
  Banknote,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Placeholder components
function HeroImagePlaceholder() {
  return (
    <div className="w-full h-[280px] sm:h-[340px] bg-muted rounded-xl flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Hero Image</div>
    </div>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
      {children}
    </div>
  );
}

function ImagePlaceholder({ width, height, className = "" }: { width: number; height: number; className?: string }) {
  return (
    <div
      className={`bg-muted rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-muted-foreground text-xs">Image</div>
    </div>
  );
}

function TestimonialCard({ name, topic, quote }: { name: string; topic: string; quote: string }) {
  return (
    <Card className="p-6 h-full">
      <div className="md:flex items-start gap-4">
        <div className="hidden md:flex w-12 h-12 rounded-full bg-muted flex-shrink-0 items-center justify-center">
          <UserRound className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-1">{name}</h4>
          <p className="text-sm text-muted-foreground mb-3">{topic}</p>
          <p className="text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>
    </Card>
  );
}

export default function BeATeacher() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = profile?.host_verified === true;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="mb-24 sm:mb-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground mb-6 leading-tight">
            Share what you know. Be a teacher.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
            Host small 60-minute classes for small groups. Teach what you&apos;re good at — we handle the rest.
          </p>
          {!isVerified && (
            <Button
              size="lg"
              onClick={() => navigate("/apply-host")}
              className="mb-10"
            >
              Get Verified
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <img
            src="/teacher-hero.jpg"
            alt="Teacher sharing knowledge with a small group"
            className="w-full h-[280px] sm:h-[340px] rounded-xl object-cover"
            width={1600}
            height={900}
            loading="eager"
          />
        </section>

        {/* Why Teach With Us */}
        <section className="mb-24 sm:mb-32">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-12">
            Why Teach With Us
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex gap-4">
                <IconCircle>
                  <Wallet className="h-7 w-7 text-foreground" />
                </IconCircle>
                <div>
                  <h3 className="text-xl font-medium mb-2">Earn while you share</h3>
                  <p className="text-muted-foreground">
                    Turn your expertise into credits. Every class you teach earns you 30 credits (£60).
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-4">
                <IconCircle>
                  <Users className="h-7 w-7 text-foreground" />
                </IconCircle>
                <div>
                  <h3 className="text-xl font-medium mb-2">Small, friendly groups</h3>
                  <p className="text-muted-foreground">
                    Intimate class sizes mean better engagement and meaningful connections with your students.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-4">
                <IconCircle>
                  <CalendarClock className="h-7 w-7 text-foreground" />
                </IconCircle>
                <div>
                  <h3 className="text-xl font-medium mb-2">Flexible schedule</h3>
                  <p className="text-muted-foreground">
                    Set your own availability. Teach when it works for you, on your own terms.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-4">
                <IconCircle>
                  <HeartHandshake className="h-7 w-7 text-foreground" />
                </IconCircle>
                <div>
                  <h3 className="text-xl font-medium mb-2">Join a community</h3>
                  <p className="text-muted-foreground">
                    Connect with other teachers and learners. Share knowledge, learn from peers, grow together.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-24 sm:mb-32">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-12">
            How It Works
          </h2>
          <div className="space-y-12 sm:space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full sm:w-auto">
                <div className="w-[120px] h-[120px] rounded-xl bg-muted flex items-center justify-center">
                  <ShieldCheck className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">Step 1</div>
                <h3 className="text-2xl font-serif font-medium mb-3">Get Verified</h3>
                <p className="text-muted-foreground">
                  Complete a quick verification process to ensure quality teaching standards. We&apos;ll review your application and get you set up.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full sm:w-auto">
                <div className="w-[120px] h-[120px] rounded-xl bg-muted flex items-center justify-center">
                  <FilePlus className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">Step 2</div>
                <h3 className="text-2xl font-serif font-medium mb-3">Create Your Class</h3>
                <p className="text-muted-foreground">
                  Design your 60-minute session. Set clear outcomes, list prerequisites, and outline what students will learn.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full sm:w-auto">
                <div className="w-[120px] h-[120px] rounded-xl bg-muted flex items-center justify-center">
                  <Banknote className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">Step 3</div>
                <h3 className="text-2xl font-serif font-medium mb-3">Host & Earn</h3>
                <p className="text-muted-foreground">
                  Run your class, share your knowledge, and earn credits. After each successful session, credits are added to your account.
                </p>
              </div>
            </div>
          </div>
          {!isVerified && (
            <div className="mt-12 text-center">
              <Button size="lg" onClick={() => navigate("/apply-host")}>
                Get Verified
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        {/* Earning & Credits Explained */}
        <section className="mb-24 sm:mb-32">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-6">
                Earning & Credits Explained
              </h2>
              <div className="space-y-4 text-muted-foreground mb-8">
                <p>
                  Our credit system makes earning simple and flexible. When you teach a class, you earn 30 credits per session.
                </p>
                <p>
                  <strong className="text-foreground">30 credits = £60</strong> when you cash out. Credits can also be used to join other classes on the platform, giving you flexibility in how you use your earnings.
                </p>
              </div>
              <Card className="p-6 bg-muted/30">
                <h3 className="font-medium mb-4">Payout Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per class taught:</span>
                    <span className="font-medium">30 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash value:</span>
                    <span className="font-medium">£60</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Alternative use:</span>
                    <span className="font-medium">Join other classes</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* What Makes a Great Class */}
        <section className="mb-24 sm:mb-32">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-12">
            What Makes a Great Class
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Clear outcomes</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Students should know exactly what they&apos;ll learn and be able to do after your class.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Prerequisites</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clearly state what students need to know or bring before attending.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Simple 60-minute syllabus</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Keep it focused. One clear topic that can be covered effectively in an hour.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Interactivity</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Engage students with hands-on activities, questions, or practice exercises.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Shareable materials</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide resources students can take away and reference later.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Practice once before teaching</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Run through your class at least once to ensure timing and flow work well.
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Button variant="link" className="p-0" onClick={() => navigate("/teacher/resources")}>
                  View sample class outline
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <img
                src="/class-placeholder.jpg"
                alt="Students collaborating during a class"
                className="w-full h-[300px] sm:h-[400px] rounded-lg object-cover"
                width={1200}
                height={800}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Teacher Stories */}
        <section className="mb-24 sm:mb-32">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-12">
            Teacher Stories
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <TestimonialCard
              name="Jeff Cheng"
              topic="Taught: Notion for Life Planning"
              quote="Teaching Notion was fun — the small group meant I could personalise the setup for each person. Watching them leave with a workspace they could actually use the next day felt great."
            />
            <TestimonialCard
              name="Abhipraya Tjondronegoro"
              topic="Taught: Intro to Adobe Illustrator"
              quote="In a group of seven, it was easy to guide everyone through their first logo. Hearing someone say, ‘I finally understand the pen tool,’ made the whole session worth it."
            />
            <TestimonialCard
              name="Nora Alharthi"
              topic="Taught: How to Perform Basic Research"
              quote="With a small class, we turned research from something intimidating into something practical. By the end, everyone could frame a clear research question — and that was incredibly rewarding."
            />
          </div>
        </section>

        

        {/* Final CTA */}
        <section className="relative mb-8">
          <div className="absolute inset-0 bg-muted/20 rounded-2xl -z-10" />
          <div className="absolute inset-0 bg-muted/30 rounded-2xl -z-10 opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="p-12 sm:p-16 text-center rounded-2xl">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-4">
              Ready to teach your first class?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Get verified in minutes and host your first group session.
            </p>
            {!isVerified && (
              <Button size="lg" onClick={() => navigate("/apply-host")}>
                Get Verified
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

