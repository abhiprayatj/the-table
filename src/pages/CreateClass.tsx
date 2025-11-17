import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const classSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  who_for: z.string().min(10, "Please describe who this class is for"),
  prerequisites: z.string().optional(),
  walk_away_with: z.string().min(10, "Please describe what participants will learn"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  what_to_bring: z.string().optional(),
  detailed_address: z.string().min(1, "Detailed address is required"),
  city: z.string().min(1, "City is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour").max(8, "Duration cannot exceed 8 hours"),
  max_participants: z.number().min(1).max(7),
});

const CATEGORIES = [
  "Arts & Crafts",
  "Languages",
  "Technology",
  "Writing",
  "Photography",
  "Other",
];

export default function CreateClass() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [whoFor, setWhoFor] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [walkAwayWith, setWalkAwayWith] = useState("");
  const [description, setDescription] = useState("");
  const [whatToBring, setWhatToBring] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [maxParticipants, setMaxParticipants] = useState("7");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profileData?.host_verified) {
      toast({
        title: "Not authorized",
        description: "You must be a verified host to create classes",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    setProfile(profileData);
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`;
        const filePath = `class-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('class-photos')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        const { data } = supabase.storage
          .from('class-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }
      
      setPhotoUrls([...photoUrls, ...uploadedUrls]);
      toast({
        title: "Photos uploaded",
        description: `Successfully uploaded ${uploadedUrls.length} photo(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate custom category if "Other" is selected
      if (category === "Other" && !customCategory.trim()) {
        toast({
          title: "Validation error",
          description: "Please enter a custom category",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate input
      classSchema.parse({
        title,
        who_for: whoFor,
        prerequisites: prerequisites || undefined,
        walk_away_with: walkAwayWith,
        description,
        what_to_bring: whatToBring || undefined,
        detailed_address: detailedAddress,
        city: city,
        date,
        time,
        duration: parseInt(duration),
        max_participants: parseInt(maxParticipants),
      });

      const { data, error } = await supabase
        .from("classes")
        .insert({
          host_id: profile.id,
          title,
          who_for: whoFor,
          prerequisites: prerequisites || null,
          walk_away_with: walkAwayWith,
          description,
          what_to_bring: whatToBring || null,
          category: category === "Other" ? customCategory : category,
          city: city,
          country: "", // Empty as we only use city now
          address: detailedAddress,
          date,
          time,
          duration: parseInt(duration),
          cost_credits: 5, // Auto-set to 5 credits
          max_participants: parseInt(maxParticipants),
          photo_urls: photoUrls.length > 0 ? photoUrls : null,
          thumbnail_url: photoUrls[0] || null, // Use first photo as thumbnail
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Class created! 🎉",
        description: "Your session is now live and ready for bookings.",
      });
      navigate(`/class/${data.id}`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create class",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-border/50">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-serif font-medium">Host a Session</CardTitle>
            <CardDescription className="text-base">
              Share your skills and knowledge with your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Class Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sourdough Baking Basics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="who_for">Who The Class is For</Label>
                <Textarea
                  id="who_for"
                  value={whoFor}
                  onChange={(e) => setWhoFor(e.target.value)}
                  placeholder="Describe who would benefit from this class..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisite / You Should Already Know</Label>
                <Textarea
                  id="prerequisites"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="What should participants already know or have experience with? (optional)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walk_away_with">What You Will Walk Away With</Label>
                <Textarea
                  id="walk_away_with"
                  value={walkAwayWith}
                  onChange={(e) => setWalkAwayWith(e.target.value)}
                  placeholder="What skills, knowledge, or items will participants gain?"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the class..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="what_to_bring">What to Bring</Label>
                <Textarea
                  id="what_to_bring"
                  value={whatToBring}
                  onChange={(e) => setWhatToBring(e.target.value)}
                  placeholder="List any materials, tools, or items participants should bring... (optional)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => {
                    setCategory(value);
                    if (value !== "Other") {
                      setCustomCategory("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category === "Other" && (
                  <div className="mt-2">
                    <Input
                      id="custom_category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter your category"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailed_address">Detailed Address</Label>
                <Input
                  id="detailed_address"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="e.g., SW5"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Postcode or area code (revealed after booking)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., London"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  City will be shown publicly
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Photos</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  disabled={uploadingPhotos}
                />
                {uploadingPhotos && (
                  <p className="text-xs text-muted-foreground">Uploading photos...</p>
                )}
                {photoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={url} 
                          alt={`Photo ${idx + 1}`} 
                          className="rounded-lg object-cover h-24 w-full border border-border/50"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Seats (max 7)</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  max="7"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  required
                />
              </div>

              <div className="bg-muted/30 p-5 rounded-lg space-y-2 border border-border/50">
                <p className="text-sm font-medium">Class Details:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Price: 5 credits (auto-set)</li>
                  <li>• Max participants: {maxParticipants}</li>
                  <li>• Location: {city}</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
