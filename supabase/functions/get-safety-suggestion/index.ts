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
    const { placeName, location, userReports } = await req.json();
    console.log('Request received:', { placeName, location, userReports });
    
    const GROQ_API_KEY = Deno.env.get('Groq_Api');
    console.log('API Key exists:', !!GROQ_API_KEY);

    if (!GROQ_API_KEY) {
      console.error('Groq_Api key not found in environment');
      throw new Error('Groq_Api key not configured');
    }

    const prompt = `You are a safety advisor for Jaipur, India. Analyze this location and provide safety recommendations in both Hindi and English.

Location: ${placeName}
Address: ${location}
User Reports: ${userReports || 'No reports yet'}

Provide a response in this exact JSON format:
{
  "safetyLevel": "safe" or "caution" or "danger",
  "english": {
    "summary": "Brief safety summary",
    "tips": ["tip1", "tip2", "tip3"]
  },
  "hindi": {
    "summary": "संक्षिप्त सुरक्षा सारांश",
    "tips": ["टिप1", "टिप2", "टिप3"]
  }
}`;

    console.log('Calling Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful safety advisor. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const safetyData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    console.log('Safety data parsed successfully');

    return new Response(JSON.stringify(safetyData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-safety-suggestion:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
