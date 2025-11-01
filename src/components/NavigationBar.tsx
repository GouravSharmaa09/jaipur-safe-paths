import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface NavigationBarProps {
  destination: string;
  distance: string;
  duration: string;
  onClose: () => void;
}

const NavigationBar = ({ 
  destination, 
  distance, 
  duration, 
  onClose
}: NavigationBarProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[1001] px-4 pb-4"
    >
      <Card className="bg-card border shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{destination}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{duration}</span>
              <span>•</span>
              <span>{distance}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NavigationBar;
