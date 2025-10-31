import { useEffect } from "react";

declare global {
  interface Window {
    voiceflow?: any;
  }
}

const VoiceflowChat = () => {
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

  return null; // This component doesn't render anything visible
};

export default VoiceflowChat;
