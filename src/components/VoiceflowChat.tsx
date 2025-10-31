import { useEffect } from "react";

const VoiceflowChat = () => {
  useEffect(() => {
    // Check if script already loaded
    if (window.voiceflow) return;

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
          },
          autostart: false
        });
        
        // Hide the chat immediately after loading
        setTimeout(() => {
          if (window.voiceflow?.chat) {
            window.voiceflow.chat.hide();
          }
        }, 100);
      }
    };
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Add CSS to control z-index and keep chatbot behind map
    const style = document.createElement('style');
    style.textContent = `
      #voiceflow-chat,
      [class*="vfrc-widget"],
      [class*="vfrc-chat"] {
        z-index: 10 !important;
      }
      .leaflet-container {
        z-index: 20 !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};

export default VoiceflowChat;
