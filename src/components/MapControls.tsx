import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Route, Volume2, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface MapControlsProps {
  onNavigate: () => void;
  onShowRoute: () => void;
  onVoiceCommand: () => void;
}

const MapControls = ({ onNavigate, onShowRoute, onVoiceCommand }: MapControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const controls = [
    { icon: Navigation, label: "Navigate", action: onNavigate },
    { icon: Route, label: "Route", action: onShowRoute },
    { icon: Volume2, label: "Voice", action: onVoiceCommand },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[1000] flex gap-2">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            {controls.map((control, index) => (
              <motion.div
                key={control.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-background/95 backdrop-blur-sm p-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      control.action();
                      setIsExpanded(false);
                    }}
                    className="h-12 w-12 hover:bg-primary/10"
                  >
                    <control.icon className="h-5 w-5" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-background/95 backdrop-blur-sm p-2">
        <Button
          size="icon"
          variant={isExpanded ? "secondary" : "ghost"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-12 w-12"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.div>
        </Button>
      </Card>
    </div>
  );
};

export default MapControls;
