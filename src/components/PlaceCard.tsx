import { motion } from "framer-motion";
import { MapPin, Shield, AlertTriangle, X, Navigation, Clock } from "lucide-react";
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

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[1001] px-4 pb-4"
    >
      <Card className="shadow-soft border-2 bg-background/95 backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg truncate">{name}</CardTitle>
              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{type}</Badge>
                <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs md:text-sm font-medium text-foreground line-clamp-2">{address}</p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs md:text-sm text-muted-foreground">{tip}</p>
          </div>
          
          {routeInfo && (
            <>
              <Separator />
              <div className="bg-primary/5 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-around gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{routeInfo.duration}</span>
                  </div>
                </div>
                {onStartNavigation && (
                  <Button
                    onClick={onStartNavigation}
                    className="w-full"
                    size="sm"
                    variant={isNavigating ? "secondary" : "default"}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isNavigating ? "Navigation Active" : "Start Navigation"}
                  </Button>
                )}
              </div>
            </>
          )}
          
          {!routeInfo && onGetRoute && (
            <Button onClick={onGetRoute} className="w-full" size="sm" variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              Get Route
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaceCard;
