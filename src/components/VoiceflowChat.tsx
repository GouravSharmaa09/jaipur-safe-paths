import { useEffect } from "react";

const VoiceflowChat = () => {
  useEffect(() => {
    // Check if script already loaded
    if (window.voiceflow) return;

    // Load Voiceflow chat widget once
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

    // Add CSS to hide the default Voiceflow launcher button completely
    const style = document.createElement('style');
    style.textContent = `
      #voiceflow-chat,
      #voiceflow-chat-frame,
      [class*="vfrc-launcher"],
      [class*="VoiceflowLauncher"],
      [id*="voiceflow"],
      div[style*="position: fixed"][style*="bottom"][style*="right"] > *,
      body > div[style*="z-index"] > div[style*="position: fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};

export default VoiceflowChat;
