import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SOSButton = () => {
  const handleSOS = () => {
    toast.error("SOS Alert Sent!", {
      description: "Emergency services have been notified. Stay safe!",
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
