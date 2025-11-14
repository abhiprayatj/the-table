import { Navigation } from "@/components/Navigation";

export default function AllClasses() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-serif font-medium mb-8 text-foreground">
          All Classes
        </h1>
        <p className="text-muted-foreground">This page will be configured later.</p>
      </main>
    </div>
  );
}

