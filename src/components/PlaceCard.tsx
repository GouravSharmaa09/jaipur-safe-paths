import { motion } from "framer-motion";
import { MapPin, Shield, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceCardProps {
  name: string;
  type: string;
  safetyLevel: "safe" | "caution" | "danger";
  tip: string;
  onClose: () => void;
}

const PlaceCard = ({ name, type, safetyLevel, tip, onClose }: PlaceCardProps) => {
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
  };

  const config = safetyConfig[safetyLevel];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40"
    >
      <Card className="shadow-soft border-2">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {type}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaceCard;
