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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAITip, setShowAITip] = useState(false);
  const [aiTip, setAiTip] = useState({ english: "", hindi: "" });
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  // Fetch address suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.address.length < 3) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            formData.address + ", Jaipur, Rajasthan, India"
          )}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'JaipurSafetyApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setAddressSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [formData.address]);

  const selectSuggestion = (suggestion: { display_name: string; lat: string; lon: string }) => {
    setFormData({ ...formData, address: suggestion.display_name });
    setShowSuggestions(false);
  };

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

  const fetchAISafetyTip = async (placeName: string, safetyLevel: string, location: string) => {
    setIsLoadingTip(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-safety-suggestion', {
        body: {
          placeName,
          location,
          userReports: `Recent report: ${safetyLevel} level at ${placeName}`
        }
      });

      if (error) throw error;

      if (data?.safetyData) {
        setAiTip({
          english: data.safetyData.english || "Stay alert and aware of your surroundings.",
          hindi: data.safetyData.hindi || "सतर्क रहें और अपने आसपास के बारे में जागरूक रहें।"
        });
        setShowAITip(true);
      }
    } catch (error) {
      console.error("Error fetching AI tip:", error);
      // Don't show error to user, just skip the tip
    } finally {
      setIsLoadingTip(false);
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

      if (!user) {
        toast.error("Please sign in to submit a report");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
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

      toast.success("Report submitted successfully! 🎉");
      
      // Fetch AI safety tip
      await fetchAISafetyTip(formData.placeName, formData.safetyLevel, formData.address);
      
      // Reset form
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

                <div className="space-y-2 relative">
                  <Label htmlFor="address" className="text-base">Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., Hawa Mahal, MI Road, Panch Batti"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                    className="h-12 text-base"
                    required
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                        >
                          <p className="text-sm font-medium">{suggestion.display_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Type to see suggestions • Coordinates will be found automatically
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

      <Dialog open={showAITip} onOpenChange={setShowAITip}>
        <DialogContent className="max-w-lg z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Safety Tip</DialogTitle>
            <DialogDescription>
              AI-generated safety advice based on recent reports
            </DialogDescription>
          </DialogHeader>
          {isLoadingTip ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">🇬🇧 English</h3>
                <p className="text-muted-foreground">{aiTip.english}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">🇮🇳 हिंदी</h3>
                <p className="text-muted-foreground">{aiTip.hindi}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Report;
