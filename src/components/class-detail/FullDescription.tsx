import { Card, CardContent } from "@/components/ui/card";

interface FullDescriptionProps {
  content: string;
}

export function FullDescription({ content }: FullDescriptionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif font-medium mb-4">
          About This Session
        </h2>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

