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
          },
          autostart: false,
          render: {
            mode: 'embedded',
            showLauncher: false
          }
        });
      }
    };
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Hide only the default launcher button, keep chat window functional
    const style = document.createElement('style');
    style.textContent = `
      [class*="vfrc-launcher"],
      [class*="VoiceflowLauncher"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};

export default VoiceflowChat;
