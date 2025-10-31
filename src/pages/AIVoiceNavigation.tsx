import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

declare global {
  interface Window {
    voiceflow?: any;
  }
}

const AIVoiceNavigation = () => {
  useEffect(() => {
    // Load Voiceflow chat widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() {
      if (window.voiceflow) {
        window.voiceflow.chat.load({
          verify: { projectID: '6905174e353d04e3f7aa12ae' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
        
        // Auto-open the chat widget after a short delay
        setTimeout(() => {
          if (window.voiceflow?.chat) {
            window.voiceflow.chat.open();
          }
        }, 1000);
      }
    };
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    return () => {
      // Cleanup script on unmount
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Close chat widget on unmount
      if (window.voiceflow?.chat) {
        window.voiceflow.chat.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
            AI Voice Navigation
          </h1>
          <p className="text-muted-foreground mb-8">
            Get personalized navigation assistance with our AI-powered voice guide. 
            Click the chat icon to start a conversation.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIVoiceNavigation;
