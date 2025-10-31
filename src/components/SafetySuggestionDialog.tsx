import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

interface SafetySuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeName: string;
  location: string;
  userReports?: number;
}

export const SafetySuggestionDialog = ({
  open,
  onOpenChange,
  placeName,
  location,
  userReports,
}: SafetySuggestionDialogProps) => {
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  // Determine safety level based on location data
  const getSafetyLevel = (): "safe" | "caution" | "danger" => {
    if (userReports && userReports > 5) return "danger";
    if (userReports && userReports > 2) return "caution";
    return "safe";
  };

  const safetyLevel = getSafetyLevel();

  const safetyInfo = {
    safe: {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      english: {
        title: "SAFE AREA",
        summary: "This area is generally considered safe for visitors. Normal safety precautions apply.",
        tips: [
          "Keep your belongings secure",
          "Stay aware of your surroundings",
          "Use well-lit paths at night",
          "Keep emergency numbers handy"
        ]
      },
      hindi: {
        title: "सुरक्षित क्षेत्र",
        summary: "यह क्षेत्र आम तौर पर आगंतुकों के लिए सुरक्षित माना जाता है। सामान्य सुरक्षा सावधानियां लागू होती हैं।",
        tips: [
          "अपने सामान को सुरक्षित रखें",
          "अपने आसपास के प्रति सजग रहें",
          "रात में अच्छी तरह से रोशनी वाले रास्ते का उपयोग करें",
          "आपातकालीन नंबर तैयार रखें"
        ]
      }
    },
    caution: {
      icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      english: {
        title: "EXERCISE CAUTION",
        summary: `This location has ${userReports || 0} safety reports. Exercise caution and stay vigilant.`,
        tips: [
          "Avoid visiting alone, especially at night",
          "Keep valuables out of sight",
          "Stay in crowded, well-lit areas",
          "Trust your instincts - leave if uncomfortable",
          "Share your location with friends/family"
        ]
      },
      hindi: {
        title: "सावधानी बरतें",
        summary: `इस स्थान पर ${userReports || 0} सुरक्षा रिपोर्ट हैं। सावधानी बरतें और सतर्क रहें।`,
        tips: [
          "अकेले जाने से बचें, विशेष रूप से रात में",
          "कीमती सामान छिपाकर रखें",
          "भीड़-भाड़ वाले, अच्छी रोशनी वाले क्षेत्रों में रहें",
          "अपनी प्रवृत्ति पर भरोसा करें - असहज महसूस हो तो वहां से चले जाएं",
          "अपनी स्थिति दोस्तों/परिवार के साथ साझा करें"
        ]
      }
    },
    danger: {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      english: {
        title: "HIGH RISK AREA",
        summary: `This location has ${userReports || 0} safety reports indicating significant concerns. Consider alternative locations.`,
        tips: [
          "Avoid this area if possible",
          "Do not visit alone or at night",
          "Keep emergency services on speed dial (Police: 100, Emergency: 112)",
          "Inform someone of your whereabouts",
          "Stay on main roads and avoid shortcuts",
          "Consider hiring a local guide"
        ]
      },
      hindi: {
        title: "उच्च जोखिम क्षेत्र",
        summary: `इस स्थान पर ${userReports || 0} सुरक्षा रिपोर्ट हैं जो महत्वपूर्ण चिंताओं का संकेत देती हैं। वैकल्पिक स्थानों पर विचार करें।`,
        tips: [
          "संभव हो तो इस क्षेत्र से बचें",
          "अकेले या रात में न जाएं",
          "आपातकालीन सेवाओं को स्पीड डायल पर रखें (पुलिस: 100, आपातकालीन: 112)",
          "किसी को अपने ठिकाने की जानकारी दें",
          "मुख्य सड़कों पर रहें और शॉर्टकट से बचें",
          "स्थानीय गाइड को किराए पर लेने पर विचार करें"
        ]
      }
    }
  };

  const currentInfo = safetyInfo[safetyLevel];
  const currentData = currentInfo[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto z-[9999]" aria-describedby="safety-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">{placeName}</DialogTitle>
        </DialogHeader>
        <p id="safety-description" className="sr-only">
          Safety information for this location
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

          <div className={`p-4 rounded-lg ${currentInfo.bgColor}`}>
            <div className="flex items-center gap-3 mb-3">
              {currentInfo.icon}
              <h3 className={`text-lg font-semibold ${currentInfo.color}`}>
                {currentData.title}
              </h3>
            </div>
            <p className="text-foreground/90">{currentData.summary}</p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">
              {language === "english" ? "Safety Tips:" : "सुरक्षा सुझाव:"}
            </h4>
            <ul className="space-y-2">
              {currentData.tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-foreground/90">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {userReports !== undefined && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              {language === "english" 
                ? `Based on ${userReports} community report${userReports !== 1 ? 's' : ''}`
                : `${userReports} सामुदायिक रिपोर्ट के आधार पर`
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
