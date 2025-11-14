import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";

export function CreditsSection() {
  const navigate = useNavigate();

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Coins className="w-8 h-8 text-primary" />
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground">
            Credits
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">
          1 credit for 2 pounds
        </p>
        <Button
          onClick={() => navigate("/profile")}
          className="rounded-full"
          size="lg"
        >
          Top Up Credits
        </Button>
      </div>
    </section>
  );
}

