import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Rey",
    role: "Software Engineer",
    classAttended: "Vibecoding – Write your first Python script",
    quote: "In 60 minutes I got further than in a week of tutorials. Small group, direct questions, and I left with a working script on my laptop.",
  },
  {
    name: "Dana",
    role: "MSc Strategic Marketing",
    classAttended: "Data Basics for Marketers",
    quote: "It felt safe to ask 'stupid' questions. I finally understood the numbers instead of pretending I did in a big lecture.",
  },
  {
    name: "Alex",
    role: "Product Designer",
    classAttended: "Illustrator for Logo Tweaks",
    quote: "We sat around a table, opened our files, and fixed my logo together. No theory dump—just practical help I used the next day.",
  },
  {
    name: "Mira",
    role: "UX Student",
    classAttended: "Notion – Organise Your Semester",
    quote: "I walked out with a Notion setup that actually works for me. It felt more like a study group than a class.",
  },
];

export function ReviewsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const firstCard = container.querySelector(".review-card") as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 16; // space-x-4 = 1rem = 16px
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full">
      <div className="w-full flex justify-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-center text-foreground">
          What People Are Saying
        </h2>
      </div>

      <div className="relative">
        {/* Desktop scroll buttons */}
        <div className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
        </div>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              className="review-card w-full sm:w-auto min-w-0 sm:min-w-[320px] lg:min-w-[360px] snap-start flex-shrink-0"
            >
              <Card className="border-border/50 h-full shadow-sm rounded-xl w-full">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="font-serif font-medium text-base sm:text-lg text-foreground">
                      {review.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{review.role}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    Attended: {review.classAttended}
                  </p>
                  <blockquote className="text-sm sm:text-base text-foreground leading-relaxed break-words">
                    "{review.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Desktop scroll buttons */}
        <div className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

