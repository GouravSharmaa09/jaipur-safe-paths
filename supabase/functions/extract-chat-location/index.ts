import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation } = await req.json();
    console.log('Extracting location from conversation');
    
    const GROQ_API_KEY = Deno.env.get('Groq_Api');

    if (!GROQ_API_KEY) {
      console.error('Groq_Api key not found');
      throw new Error('Groq_Api key not configured');
    }

    const prompt = `Analyze this conversation and extract any location mentioned in Jaipur, India. 
    
Conversation: ${conversation}

If a specific location, place, landmark, or address in Jaipur is mentioned, provide it in this exact JSON format:
{
  "hasLocation": true,
  "locationName": "Name of the place",
  "lat": latitude (number),
  "lng": longitude (number)
}

Use these approximate coordinates for common Jaipur locations:
- Hawa Mahal: 26.9239, 75.8267
- City Palace: 26.9255, 75.8237
- Amer Fort: 26.9855, 75.8513
- Jaipur Railway Station: 26.9176, 75.7878
- Johri Bazaar: 26.9270, 75.8246
- MI Road: 26.9160, 75.8103
- Nahargarh Fort: 26.9368, 75.8155
- Jal Mahal: 26.9539, 75.8461
- Albert Hall Museum: 26.9065, 75.8147
- Bapu Bazaar: 26.9197, 75.7917
- JEC Kukas: 26.9450, 75.6180
- Jhalana: 26.9030, 75.8450
- Ajmer Road: 26.8930, 75.7650
- Sodala: 26.9100, 75.8000
- Bagru Road: 26.8800, 75.6900

If no specific location is mentioned or the location is not in Jaipur, respond with:
{
  "hasLocation": false
}`;

    console.log('Calling Groq API for location extraction...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a location extraction expert for Jaipur, India. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const locationData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    console.log('Location data:', locationData);

    return new Response(JSON.stringify(locationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-chat-location:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      hasLocation: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
