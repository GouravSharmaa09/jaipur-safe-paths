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
      <Card className="bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">{duration}</span>
              <span className="text-sm text-muted-foreground">({distance})</span>
            </div>
            <p className="text-sm text-foreground truncate">{destination}</p>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default NavigationBar;
