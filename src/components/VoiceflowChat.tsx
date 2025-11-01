import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoiceflowChat = () => {
  const conversationHistory = useRef<string[]>([]);
  const { toast } = useToast();

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

        // Listen to Voiceflow events
        window.voiceflow.chat.on('message', (event: any) => {
          console.log('Voiceflow message event:', event);
          if (event.type === 'text') {
            conversationHistory.current.push(`${event.isUser ? 'User' : 'Bot'}: ${event.payload.message}`);
          }
        });

        // Listen for chat close event
        window.voiceflow.chat.on('close', () => {
          console.log('Chat closed, extracting location...');
          if (conversationHistory.current.length > 0) {
            extractLocationAndShowRoute();
          }
        });

        // Listen for thumbs up feedback
        window.voiceflow.chat.on('feedback', (feedback: any) => {
          console.log('Feedback received:', feedback);
          if (feedback.type === 'positive' || feedback.value === 1) {
            console.log('Positive feedback (thumbs up), extracting location...');
            if (conversationHistory.current.length > 0) {
              extractLocationAndShowRoute();
            }
          }
        });

        // Alternative event listener for interactions
        window.voiceflow.chat.on('interact', (interaction: any) => {
          console.log('Interaction event:', interaction);
          if (interaction.type === 'complete' || interaction.type === 'end') {
            if (conversationHistory.current.length > 0) {
              extractLocationAndShowRoute();
            }
          }
        });
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
