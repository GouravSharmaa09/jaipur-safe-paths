import { motion } from "framer-motion";
import { Navigation, Clock, MapPin, X, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RouteInfoCardProps {
  distance: string;
  duration: string;
  destination: string;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onClose: () => void;
  safetyLevel?: "safe" | "caution" | "danger";
  safetyWarning?: string;
}

const RouteInfoCard = ({
  distance,
  duration,
  destination,
  isNavigating,
  onStartNavigation,
  onClose,
  safetyLevel = "safe",
  safetyWarning,
}: RouteInfoCardProps) => {
  const safetyConfig = {
    safe: {
      icon: ShieldCheck,
      color: "bg-green-500/10 text-green-700 dark:text-green-400",
      label: "Safe Route",
    },
    caution: {
      icon: AlertTriangle,
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      label: "Use Caution",
    },
    danger: {
      icon: ShieldAlert,
      color: "bg-red-500/10 text-red-700 dark:text-red-400",
      label: "High Risk",
    },
  };

  const SafetyIcon = safetyConfig[safetyLevel].icon;
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto w-auto md:w-[90%] max-w-md z-[1001]"
    >
      <Card className="shadow-sm border bg-card">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Route to {destination}</CardTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{distance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{duration}</span>
            </div>
          </div>

          {/* Safety Level Badge */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${safetyConfig[safetyLevel].color}`}>
            <SafetyIcon className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{safetyConfig[safetyLevel].label}</p>
              {safetyWarning && (
                <p className="text-xs mt-1 opacity-90">{safetyWarning}</p>
              )}
            </div>
          </div>

          <Button
            onClick={onStartNavigation}
            className="w-full"
            variant={isNavigating ? "secondary" : "default"}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isNavigating ? "Navigation Active" : "Start Navigation"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RouteInfoCard;
