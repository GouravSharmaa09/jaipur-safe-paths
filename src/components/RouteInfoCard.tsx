import { motion } from "framer-motion";
import { Navigation, Clock, MapPin, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RouteInfoCardProps {
  distance: string;
  duration: string;
  destination: string;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onClose: () => void;
}

const RouteInfoCard = ({
  distance,
  duration,
  destination,
  isNavigating,
  onStartNavigation,
  onClose,
}: RouteInfoCardProps) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto w-auto md:w-[90%] max-w-md z-[1001]"
    >
      <Card className="shadow-soft border-2 bg-background/95 backdrop-blur">
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
