import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const VoiceflowChat = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  useEffect(() => {
    // Only load chatbot on home page
    if (!isHomePage) return;

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
      // Remove widget completely
      if (window.voiceflow?.chat) {
        window.voiceflow.chat.close();
      }
    };
  }, [isHomePage]);

  return null;
};

export default VoiceflowChat;
