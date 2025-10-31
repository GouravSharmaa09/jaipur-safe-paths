import { motion } from "framer-motion";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Report = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [formData, setFormData] = useState({
    placeName: "",
    userName: "",
    address: "",
    safetyLevel: "safe" as "safe" | "caution" | "avoid",
    description: "",
  });

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using Nominatim (OpenStreetMap) for geocoding - free alternative
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address + ", Jaipur, Rajasthan, India"
        )}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'JaipurSafetyApp/1.0' // Required by Nominatim
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { 
          lat: parseFloat(data[0].lat), 
          lng: parseFloat(data[0].lon) 
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placeName || !formData.address || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    setIsGeocoding(true);

    try {
      // Geocode the address
      const coordinates = await geocodeAddress(formData.address);
      setIsGeocoding(false);

      if (!coordinates) {
        toast.error("Could not find location. Please check the address.");
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user?.id || null,
          lat: coordinates.lat,
          lng: coordinates.lng,
          type: formData.safetyLevel,
          place_name: formData.placeName,
          description: `${formData.userName ? `Reported by: ${formData.userName}\n` : ""}${formData.description}`,
        });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast.success("Thank you for your report! 🎉");
      setFormData({
        placeName: "",
        userName: "",
        address: "",
        safetyLevel: "safe",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Report a Location
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Help others by sharing your safety experience
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Safety Report
              </CardTitle>
              <CardDescription className="text-base">
                Your input helps maintain accurate safety information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="placeName" className="text-base">Place Name *</Label>
                  <Input
                    id="placeName"
                    placeholder="e.g., Hawa Mahal, Amer Fort"
                    value={formData.placeName}
                    onChange={(e) =>
                      setFormData({ ...formData, placeName: e.target.value })
                    }
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-base">Your Name (Optional)</Label>
                  <Input
                    id="userName"
                    placeholder="Your name"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base">Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., MI Road, Near Panch Batti Circle"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll automatically find the location coordinates
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Safety Level *</Label>
                  <RadioGroup
                    value={formData.safetyLevel}
                    onValueChange={(value: "safe" | "caution" | "avoid") =>
                      setFormData({ ...formData, safetyLevel: value })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                      <RadioGroupItem value="safe" id="safe" className="h-5 w-5" />
                      <Label htmlFor="safe" className="flex-1 cursor-pointer text-base font-medium">
                        ✅ Safe - Well-lit and crowded
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                      <RadioGroupItem value="caution" id="caution" className="h-5 w-5" />
                      <Label htmlFor="caution" className="flex-1 cursor-pointer text-base font-medium">
                        ⚠️ Caution - Be careful here
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                      <RadioGroupItem value="avoid" id="avoid" className="h-5 w-5" />
                      <Label htmlFor="avoid" className="flex-1 cursor-pointer text-base font-medium">
                        🚫 Danger - Avoid this area
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Share details about safety, crowd, lighting, time of visit, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={5}
                    className="text-base resize-none"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    All submissions are reviewed. False reports may result in restrictions.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isGeocoding}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Finding Location...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Report;
