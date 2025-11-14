import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl sm:text-4xl font-serif font-medium text-center mb-12 text-foreground">
        What People Are Saying
      </h2>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {reviews.map((review, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2">
              <Card className="border-border/50 h-full">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif font-medium text-lg text-foreground">
                      {review.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    Attended: {review.classAttended}
                  </p>
                  <blockquote className="text-foreground leading-relaxed">
                    "{review.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}

