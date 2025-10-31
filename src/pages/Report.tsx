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
  const [formData, setFormData] = useState({
    placeName: "",
    location: "",
    lat: "",
    lng: "",
    safetyLevel: "safe" as "safe" | "caution" | "avoid",
    experience: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate coordinates
      const latitude = parseFloat(formData.lat);
      const longitude = parseFloat(formData.lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        toast.error("Invalid coordinates", {
          description: "Please enter valid latitude and longitude values.",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Insert report
      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user?.id || null,
          lat: latitude,
          lng: longitude,
          type: formData.safetyLevel,
          place_name: formData.placeName,
          description: formData.experience,
        });

      if (error) throw error;

      toast.success("Thank you for your report!", {
        description: "Your report has been submitted and will help others stay safe.",
      });

      // Reset form
      setFormData({
        placeName: "",
        location: "",
        lat: "",
        lng: "",
        safetyLevel: "safe",
        experience: "",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report", {
        description: "Please try again later.",
      });
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Report a Location
            </h1>
            <p className="text-muted-foreground">
              Help fellow travelers stay safe by sharing your experience
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Safety Report Form
              </CardTitle>
              <CardDescription>
                Your input helps us maintain accurate safety information for all travelers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="place-name">Place Name</Label>
                  <Input
                    id="place-name"
                    placeholder="Enter the name of the location"
                    value={formData.placeName}
                    onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location/Address</Label>
                  <Input
                    id="location"
                    placeholder="Specific address or landmark"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="26.9124"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="75.7873"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Safety Level</Label>
                  <RadioGroup 
                    value={formData.safetyLevel}
                    onValueChange={(value) => setFormData({ ...formData, safetyLevel: value as "safe" | "caution" | "avoid" })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="safe" id="safe" />
                      <Label htmlFor="safe" className="font-normal cursor-pointer">
                        Safe - Recommended for all travelers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="caution" id="caution" />
                      <Label htmlFor="caution" className="font-normal cursor-pointer">
                        Caution - Be aware of surroundings
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="avoid" id="avoid" />
                      <Label htmlFor="avoid" className="font-normal cursor-pointer">
                        Avoid - Not recommended, especially at night
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Your Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe your experience and any safety tips..."
                    rows={5}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    All submissions are reviewed before being added to the map. False reports may result in account restrictions.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
