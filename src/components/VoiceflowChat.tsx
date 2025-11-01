import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoiceflowChat = () => {
  const conversationHistory = useRef<string[]>([]);
  const { toast } = useToast();
  const messageObserver = useRef<MutationObserver | null>(null);

  const extractLocationAndShowRoute = async () => {
    try {
      const conversation = conversationHistory.current.join('\n');
      console.log('Extracting location from conversation:', conversation);

      const { data, error } = await supabase.functions.invoke('extract-chat-location', {
        body: { conversation }
      });

      if (error) throw error;

      console.log('Location extraction result:', data);

      if (data.hasLocation) {
        // Trigger route display on map
        const event = new CustomEvent('mapRouteRequest', { 
          detail: {
            lat: data.lat,
            lng: data.lng,
            name: data.locationName
          }
        });
        window.dispatchEvent(event);

        toast({
          title: "Location Found!",
          description: `Showing route to ${data.locationName}`,
        });

        // Navigate to map page
        window.location.href = '/map';
      } else {
        toast({
          title: "No Location Found",
          description: "Please mention a specific place in Jaipur to see the route.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error extracting location:', error);
      toast({
        title: "Error",
        description: "Failed to process location from chat.",
        variant: "destructive"
      });
    }
  };

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

        // Monitor chat messages by observing DOM changes
        const startMessageObserver = () => {
          console.log('🔍 Starting message observer...');
          
          // Wait for chat container to be available
          const checkForChat = setInterval(() => {
            const chatContainer = document.querySelector('[class*="vfrc"]');
            
            if (chatContainer) {
              console.log('✅ Found Voiceflow chat container');
              clearInterval(checkForChat);
              
              // Create observer to watch for new messages
              messageObserver.current = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                      const element = node as HTMLElement;
                      
                      // Look for message text in various possible selectors
                      const messageText = element.textContent || element.innerText;
                      
                      if (messageText && messageText.trim().length > 0) {
                        // Check if it's likely a message (not just UI text)
                        if (messageText.length > 5 && !messageText.includes('<!--')) {
                          console.log('📝 Captured message:', messageText.substring(0, 50) + '...');
                          conversationHistory.current.push(messageText.trim());
                          console.log('Total messages captured:', conversationHistory.current.length);
                        }
                      }
                    }
                  });
                });
              });
              
              messageObserver.current.observe(chatContainer, {
                childList: true,
                subtree: true,
                characterData: true
              });
              
              console.log('👂 Message observer active');
            }
          }, 500);
          
          // Stop checking after 10 seconds
          setTimeout(() => clearInterval(checkForChat), 10000);
        };

        startMessageObserver();

        // Add prominent "Show Route" button
        const addShowRouteButton = () => {
          const buttonHtml = `
            <div id="show-route-btn" style="
              position: fixed;
              bottom: 100px;
              right: 20px;
              z-index: 99999;
              display: block;
              animation: pulse 2s infinite;
            ">
              <style>
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
                #show-route-btn button:hover {
                  background: #FF1A7D !important;
                  transform: scale(1.05);
                }
              </style>
              <button id="route-btn" style="
                background: linear-gradient(135deg, #FF389E 0%, #FF1A7D 100%);
                color: white;
                padding: 14px 28px;
                border-radius: 12px;
                border: none;
                cursor: pointer;
                font-weight: 700;
                font-size: 15px;
                box-shadow: 0 8px 16px rgba(255, 56, 158, 0.4);
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
              " onclick="window.triggerRouteExtraction()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Show Route 🗺️
              </button>
            </div>
          `;
          
          // Remove old button if exists
          const oldBtn = document.getElementById('show-route-btn');
          if (oldBtn) oldBtn.remove();
          
          document.body.insertAdjacentHTML('beforeend', buttonHtml);
          console.log('✅ Show Route button added');
        };

        // Global function to trigger route extraction
        (window as any).triggerRouteExtraction = async () => {
          console.log('🚀 Manual route extraction triggered');
          console.log('📚 Conversation history:', conversationHistory.current);
          
          const btn = document.getElementById('route-btn') as HTMLButtonElement;
          if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.innerHTML = `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Processing...
            `;
          }
          
          if (conversationHistory.current.length > 0) {
            await extractLocationAndShowRoute();
          } else {
            console.warn('⚠️ No conversation history found');
            alert('Pehle chatbot se location ke baare mein puchiye!');
          }
          
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Show Route 🗺️
            `;
          }
        };

        setTimeout(addShowRouteButton, 1500);
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

    // Cleanup observer on unmount
    return () => {
      if (messageObserver.current) {
        messageObserver.current.disconnect();
      }
    };
  }, []);

  return null;
};

export default VoiceflowChat;
