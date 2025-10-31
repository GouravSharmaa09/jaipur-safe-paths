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
    const { instruction, language = 'english' } = await req.json();
    const GROQ_API_KEY = Deno.env.get('Groq_Api');

    if (!GROQ_API_KEY) {
      throw new Error('Groq_Api key not configured');
    }

    const systemPrompt = language === 'hindi' 
      ? 'आप एक सहायक नेविगेशन सहायक हैं। संक्षिप्त और स्पष्ट दिशा-निर्देश प्रदान करें।'
      : 'You are a helpful navigation assistant. Provide brief and clear directions.';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: instruction }
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const voiceInstruction = data.choices[0].message.content;

    return new Response(JSON.stringify({ instruction: voiceInstruction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in voice-navigation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
