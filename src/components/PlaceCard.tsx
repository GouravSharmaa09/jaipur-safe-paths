import { motion } from "framer-motion";
import { MapPin, Shield, AlertTriangle, X, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlaceCardProps {
  name: string;
  type: string;
  safetyLevel: "safe" | "caution" | "danger" | "avoid";
  tip: string;
  address?: string;
  onClose: () => void;
  onGetRoute?: () => void;
}

const PlaceCard = ({ name, type, safetyLevel, tip, address, onClose, onGetRoute }: PlaceCardProps) => {
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
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto w-auto md:w-[90%] max-w-md z-[1001]"
    >
      <Card className="shadow-soft border-2 bg-background/95 backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline">{type}</Badge>
                <Badge className={config.color}>{config.label}</Badge>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">{address}</p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
          {onGetRoute && (
            <Button onClick={onGetRoute} className="w-full" variant="outline">
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
