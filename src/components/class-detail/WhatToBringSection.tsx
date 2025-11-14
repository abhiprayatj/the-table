import { Card, CardContent } from "@/components/ui/card";
import { parseToBullets } from "./utils";

interface WhatToBringSectionProps {
  content: string | null;
}

export function WhatToBringSection({ content }: WhatToBringSectionProps) {
  if (!content) return null;

  const bullets = parseToBullets(content);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif font-medium mb-4">
          What to Bring
        </h2>
        {bullets.length > 0 ? (
          <ul className="space-y-2 list-disc list-inside text-muted-foreground leading-relaxed">
            {bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

