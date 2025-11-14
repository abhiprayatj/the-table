import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface CreditPackage {
  name: string;
  credits: number;
  price: number;
  benefit: string;
  badge?: string;
}

const packages: CreditPackage[] = [
  {
    name: "Starter",
    credits: 5,
    price: 19.99,
    benefit: "Perfect for trying out a class",
  },
  {
    name: "Standard",
    credits: 15,
    price: 55.99,
    benefit: "Great for regular learners",
    badge: "Most popular",
  },
  {
    name: "Value",
    credits: 25,
    price: 89.99,
    benefit: "Best for committed learners",
    badge: "Best value",
  },
];

interface Credits {
  topped_up_balance: number;
  teaching_balance: number;
}

export function CreditsSection() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      } else {
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();
    setCredits(data);
  };

  const handlePackageClick = (pkg: CreditPackage) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase credits",
        variant: "destructive",
      });
      return;
    }
    setSelectedPackage(pkg);
  };

  const handleConfirm = async () => {
    if (!selectedPackage || !user || !credits) return;

    setIsProcessing(true);

    try {
      // Update credits balance
      const { error: updateError } = await supabase
        .from("credits")
        .update({
          topped_up_balance: (credits.topped_up_balance || 0) + selectedPackage.credits,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          type: "top_up",
          amount: selectedPackage.credits,
        });

      if (transactionError) throw transactionError;

      // Refresh credits
      await fetchCredits(user.id);

      // Notify Navigation component to refresh credits
      window.dispatchEvent(new CustomEvent("credits-updated"));

      toast({
        title: "Credits added! 💜",
        description: `You've added ${selectedPackage.credits} credits to your account`,
      });

      setSelectedPackage(null);
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({
        title: "Error",
        description: "Failed to add credits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-4 mb-12">
        <div className="flex items-center justify-center gap-3">
          <Coins className="w-8 h-8 text-primary" />
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground">
            Get Credits
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pick a bundle, confirm, and you're ready to book your next class.
        </p>
        {user && credits && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="text-sm text-muted-foreground">Current balance:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--topped-up-credit))]" />
                <span className="font-medium text-foreground">
                  {credits.topped_up_balance || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--teaching-credit))]" />
                <span className="font-medium text-foreground">
                  {credits.teaching_balance || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.name}
            className="relative border-border/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
            onClick={() => handlePackageClick(pkg)}
          >
            {pkg.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-primary text-primary-foreground">
                  {pkg.badge}
                </Badge>
              </div>
            )}
            <CardContent className="pt-8 pb-6 px-6">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                    {pkg.name}
                  </h3>
                  <div className="text-4xl font-serif font-medium text-foreground mb-1">
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-muted-foreground">credits</div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="text-3xl font-serif font-medium text-foreground mb-2">
                    £{pkg.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {pkg.benefit}
                  </p>
                  <Button className="w-full" size="lg">
                    Choose
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={selectedPackage !== null}
        onOpenChange={(open) => {
          if (!isProcessing && !open) {
            setSelectedPackage(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPackage &&
                `You're about to add ${selectedPackage.credits} credits for £${selectedPackage.price.toFixed(2)}. Continue?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

