import { motion } from "framer-motion";
import { MapPin, Shield, AlertTriangle, X, Navigation, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PlaceCardProps {
  name: string;
  type: string;
  safetyLevel: "safe" | "caution" | "danger" | "avoid";
  tip: string;
  address?: string;
  routeInfo?: {
    distance: string;
    duration: string;
    safetyLevel?: "safe" | "caution" | "danger";
    safetyWarning?: string;
  };
  isNavigating?: boolean;
  onClose: () => void;
  onGetRoute?: () => void;
  onStartNavigation?: () => void;
}

const PlaceCard = ({ 
  name, 
  type, 
  safetyLevel, 
  tip, 
  address, 
  routeInfo,
  isNavigating,
  onClose, 
  onGetRoute,
  onStartNavigation 
}: PlaceCardProps) => {
  const safetyConfig = {
    safe: {
      color: "bg-secondary text-secondary-foreground",
      icon: Shield,
      label: "Safe Zone",
    },
    caution: {
      color: "bg-accent text-accent-foreground",
      icon: AlertTriangle,
      label: "Use Caution",
    },
    danger: {
      color: "bg-destructive text-destructive-foreground",
      icon: AlertTriangle,
      label: "Avoid at Night",
    },
    avoid: {
      color: "bg-destructive text-destructive-foreground",
      icon: AlertTriangle,
      label: "Avoid",
    },
  };

  const config = safetyConfig[safetyLevel];
  const Icon = config.icon;

  const routeSafetyConfig = {
    safe: {
      icon: ShieldCheck,
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      label: "Safe Route",
    },
    caution: {
      icon: AlertTriangle,
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      label: "Use Caution",
    },
    danger: {
      icon: ShieldAlert,
      color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      label: "High Risk",
    },
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[1001] px-4 pb-4"
    >
      <Card className="shadow-elevated border-2 glass-card">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2.5 md:p-3 rounded-xl ${config.color} flex-shrink-0 shadow-soft`}>
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg md:text-xl font-bold truncate">{name}</CardTitle>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1.5">
                <Badge variant="outline" className="text-xs font-medium">{type}</Badge>
                <Badge className={`${config.color} text-xs font-semibold shadow-soft`}>{config.label}</Badge>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/80 transition-all duration-200 flex-shrink-0 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {address && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm md:text-base font-medium text-foreground line-clamp-2">{address}</p>
            </div>
          )}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/10">
            <Shield className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm md:text-base text-foreground/90">{tip}</p>
          </div>
          
          {routeInfo && (
            <>
              <Separator className="my-3" />
              <div className="gradient-primary rounded-2xl p-4 md:p-5 space-y-4 shadow-glow">
                <div className="flex items-center justify-around gap-4 md:gap-6">
                  <div className="flex items-center gap-2.5 bg-background/20 backdrop-blur px-4 py-2 rounded-xl">
                    <MapPin className="h-5 w-5 text-white" />
                    <span className="text-base md:text-lg font-bold text-white">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-background/20 backdrop-blur px-4 py-2 rounded-xl">
                    <Clock className="h-5 w-5 text-white" />
                    <span className="text-base md:text-lg font-bold text-white">{routeInfo.duration}</span>
                  </div>
                </div>
                
                {/* Route Safety Level */}
                {routeInfo.safetyLevel && (() => {
                  const RouteSafetyIcon = routeSafetyConfig[routeInfo.safetyLevel].icon;
                  return (
                    <div className={`flex items-start gap-3 p-3 md:p-4 rounded-xl border-2 bg-background/95 backdrop-blur ${routeSafetyConfig[routeInfo.safetyLevel].color}`}>
                      <RouteSafetyIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-bold">{routeSafetyConfig[routeInfo.safetyLevel].label}</p>
                        {routeInfo.safetyWarning && (
                          <p className="text-xs md:text-sm mt-1 opacity-90">{routeInfo.safetyWarning}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {onStartNavigation && (
                  <Button
                    onClick={onStartNavigation}
                    className="w-full shadow-elevated hover:scale-105 transition-transform duration-200 h-11 md:h-12 text-base font-semibold"
                    size="lg"
                    variant={isNavigating ? "secondary" : "default"}
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    {isNavigating ? "Navigation Active" : "Start Navigation"}
                  </Button>
                )}
              </div>
            </>
          )}
          
          {!routeInfo && onGetRoute && (
            <Button onClick={onGetRoute} className="w-full shadow-soft hover:shadow-elevated transition-all duration-200 h-11 md:h-12 text-base font-semibold" size="lg" variant="outline">
              <Navigation className="h-5 w-5 mr-2" />
              Get Route
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaceCard;
