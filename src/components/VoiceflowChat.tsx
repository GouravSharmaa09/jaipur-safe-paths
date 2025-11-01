import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoiceflowChat = () => {
  const conversationHistory = useRef<string[]>([]);
  const { toast } = useToast();
  const messageObserver = useRef<MutationObserver | null>(null);
  const chatObserver = useRef<MutationObserver | null>(null);
  const isChatOpen = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

        // Simple polling to detect chat state changes
        pollIntervalRef.current = setInterval(() => {
          const chatContainer = document.querySelector('[class*="vfrc-chat"]') as HTMLElement;
          
          if (chatContainer) {
            const isOpen = chatContainer.style.display !== 'none' && 
                          chatContainer.style.visibility !== 'hidden' &&
                          window.getComputedStyle(chatContainer).display !== 'none';
            
            // Chat closed
            if (isChatOpen.current && !isOpen) {
              console.log('🚪 Chat closed detected!');
              console.log('📚 Conversation messages:', conversationHistory.current.length);
              console.log('📝 Full conversation:', conversationHistory.current);
              
              if (conversationHistory.current.length > 2) {
                console.log('🚀 Triggering route extraction...');
                extractLocationAndShowRoute();
              } else {
                console.log('⚠️ Not enough messages in conversation');
              }
              
              isChatOpen.current = false;
            }
            // Chat opened
            else if (!isChatOpen.current && isOpen) {
              console.log('🚪 Chat opened');
              isChatOpen.current = true;
            }
          }
        }, 500);
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

    // Cleanup observers on unmount
    return () => {
      if (messageObserver.current) {
        messageObserver.current.disconnect();
      }
      if (chatObserver.current) {
        chatObserver.current.disconnect();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return null;
};

export default VoiceflowChat;
