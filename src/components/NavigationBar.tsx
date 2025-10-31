import { motion } from "framer-motion";
import { Navigation, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface NavigationBarProps {
  destination: string;
  distance: string;
  duration: string;
  onClose: () => void;
  onCenterLocation: () => void;
}

const NavigationBar = ({ 
  destination, 
  distance, 
  duration, 
  onClose, 
  onCenterLocation 
}: NavigationBarProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[1001] px-4 pb-4"
    >
      <Card className="shadow-elevated bg-background border-2">
        <div className="flex items-center gap-3 p-4">
          <Button
            size="icon"
            variant="secondary"
            onClick={onCenterLocation}
            className="rounded-full h-12 w-12 shadow-lg flex-shrink-0"
          >
            <Navigation className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-primary">{duration}</span>
              <span className="text-sm text-muted-foreground">({distance})</span>
            </div>
            <p className="text-sm text-foreground truncate">{destination}</p>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="rounded-full h-10 w-10 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default NavigationBar;
