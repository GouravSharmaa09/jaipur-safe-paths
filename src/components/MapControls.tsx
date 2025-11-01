import { Navigation, Route, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface MapControlsProps {
  onNavigate: () => void;
  onShowRoute: () => void;
  onVoiceCommand: () => void;
}

const MapControls = ({ onNavigate, onShowRoute, onVoiceCommand }: MapControlsProps) => {
  const controls = [
    { icon: Navigation, label: "Navigate", action: onNavigate },
    { icon: Route, label: "Route", action: onShowRoute },
    { icon: Volume2, label: "Voice", action: onVoiceCommand },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      {controls.map((control) => (
        <Card key={control.label} className="bg-background/95 backdrop-blur-sm p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={control.action}
            className="h-12 w-12 hover:bg-primary/10"
            title={control.label}
          >
            <control.icon className="h-5 w-5" />
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default MapControls;
