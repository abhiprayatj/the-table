import { Card, CardContent } from "@/components/ui/card";

interface OutcomeSectionProps {
  content: string | null;
}

export function OutcomeSection({ content }: OutcomeSectionProps) {
  if (!content) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif font-medium mb-4">
          What You Will Walk Away With
        </h2>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

