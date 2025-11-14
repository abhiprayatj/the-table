import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Choose a Session",
    description: "Browse small, offline classes and pick a skill you want to learn. Every session shows clear outcomes and prerequisites.",
  },
  {
    icon: Users,
    title: "Join the Table",
    description: "Sit down with up to 7 people for a focused 60-minute session where you can ask anything and learn directly.",
  },
  {
    icon: Sparkles,
    title: "Leave With Something Real",
    description: "Walk away with a tangible output or a clear next step on your learning path.",
  },
];

export function UserJourney() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-serif font-medium text-center mb-12 text-foreground">
          How to Participate
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-center text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

