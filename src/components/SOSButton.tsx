import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SOSButton = () => {
  const { toast } = useToast();

  const handleSOS = () => {
    // Open emergency dialer (112 is the emergency number in India)
    window.location.href = 'tel:112';
    
    toast({
      title: "Opening Emergency Dialer",
      description: "Calling 112 - India Emergency Services",
      variant: "destructive"
    });
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleSOS}
        className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 shadow-soft animate-pulse-soft"
      >
        <AlertTriangle className="h-8 w-8 text-destructive-foreground" />
      </Button>
    </motion.div>
  );
};

export default SOSButton;
