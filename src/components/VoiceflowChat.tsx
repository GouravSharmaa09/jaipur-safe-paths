import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";

const VoiceflowChat = () => {
  const conversationHistory = useRef<string[]>([]);
  const { toast } = useToast();
  const hasShownButton = useRef(false);

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

        // Comprehensive event logging to understand what events are available
        const logAllEvents = () => {
          console.log('=== Voiceflow Events Logging Started ===');
          
          // Try to attach to any possible event
          const possibleEvents = ['message', 'close', 'open', 'feedback', 'interact', 'end', 'complete', 'update', 'change'];
          
          possibleEvents.forEach(eventName => {
            try {
              window.voiceflow.chat.on(eventName, (data: any) => {
                console.log(`🔔 Voiceflow Event [${eventName}]:`, data);
                
                // Store conversation messages
                if (eventName === 'message' && data) {
                  const messageText = data.payload?.message || data.text || data.content || '';
                  const isUser = data.isUser || data.type === 'request';
                  if (messageText) {
                    conversationHistory.current.push(`${isUser ? 'User' : 'Bot'}: ${messageText}`);
                    console.log('Stored message:', messageText);
                    console.log('Total messages:', conversationHistory.current.length);
                  }
                }
                
                // Trigger location extraction on certain events
                if (['close', 'end', 'complete'].includes(eventName) && conversationHistory.current.length > 0) {
                  console.log('Triggering location extraction from event:', eventName);
                  extractLocationAndShowRoute();
                }
              });
            } catch (error) {
              console.log(`Could not attach to event: ${eventName}`, error);
            }
          });
        };

        logAllEvents();

        // Add a custom button to manually trigger location extraction after chat
        const addShowRouteButton = () => {
          if (hasShownButton.current) return;
          
          const buttonHtml = `
            <div id="show-route-btn" style="
              position: fixed;
              bottom: 100px;
              right: 20px;
              z-index: 9999;
              display: none;
            ">
              <button style="
                background: #FF389E;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 8px;
              " onclick="window.triggerRouteExtraction()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Show Route on Map
              </button>
            </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', buttonHtml);
          hasShownButton.current = true;

          // Show button when chat opens
          const originalOpen = window.voiceflow.chat.open;
          window.voiceflow.chat.open = function() {
            originalOpen.apply(this, arguments);
            const btn = document.getElementById('show-route-btn');
            if (btn) btn.style.display = 'block';
          };

          // Hide button when chat closes
          const originalClose = window.voiceflow.chat.close;
          window.voiceflow.chat.close = function() {
            originalClose.apply(this, arguments);
            const btn = document.getElementById('show-route-btn');
            if (btn) btn.style.display = 'none';
          };
        };

        // Global function to trigger route extraction
        (window as any).triggerRouteExtraction = () => {
          console.log('Manual route extraction triggered');
          console.log('Conversation history:', conversationHistory.current);
          if (conversationHistory.current.length > 0) {
            extractLocationAndShowRoute();
          } else {
            toast({
              title: "No Conversation",
              description: "Please chat with the bot about a location first.",
              variant: "destructive"
            });
          }
        };

        setTimeout(addShowRouteButton, 1000);
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
