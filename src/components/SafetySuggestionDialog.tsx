import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SafetySuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeName: string;
  location: string;
  userReports?: number;
}

interface SafetyData {
  safetyLevel: "safe" | "caution" | "danger";
  english: {
    summary: string;
    tips: string[];
  };
  hindi: {
    summary: string;
    tips: string[];
  };
}

export const SafetySuggestionDialog = ({
  open,
  onOpenChange,
  placeName,
  location,
  userReports,
}: SafetySuggestionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  const fetchSafetySuggestion = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-safety-suggestion", {
        body: {
          placeName,
          location,
          userReports: userReports || 0,
        },
      });

      if (error) throw error;
      setSafetyData(data);
    } catch (error) {
      console.error("Error fetching safety suggestion:", error);
      toast.error("Failed to get safety suggestions");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hindi" ? "hi-IN" : "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Voice not supported on this device");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !safetyData) {
      fetchSafetySuggestion();
    }
    onOpenChange(newOpen);
  };

  const currentData = safetyData?.[language];
  const safetyColors = {
    safe: "text-green-600 dark:text-green-400",
    caution: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="safety-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">{placeName}</DialogTitle>
        </DialogHeader>
        <p id="safety-description" className="sr-only">
          AI-powered safety suggestions for this location
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={language === "english" ? "default" : "outline"}
              onClick={() => setLanguage("english")}
              className="flex-1"
            >
              English
            </Button>
            <Button
              variant={language === "hindi" ? "default" : "outline"}
              onClick={() => setLanguage("hindi")}
              className="flex-1"
            >
              हिंदी
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : safetyData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${safetyColors[safetyData.safetyLevel]}`}>
                    {safetyData.safetyLevel.toUpperCase()}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(currentData?.summary || "")}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-foreground/90">{currentData?.summary}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">
                    {language === "english" ? "Safety Tips:" : "सुरक्षा सुझाव:"}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(currentData?.tips.join(". ") || "")}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {currentData?.tips.map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-foreground/90">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Click Refresh to get safety suggestions
            </p>
          )}

          {safetyData && (
            <Button
              onClick={fetchSafetySuggestion}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
