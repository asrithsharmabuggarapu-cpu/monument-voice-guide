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
    const { text, language } = await req.json();
    console.log('Text-to-speech request:', { text, language });

    if (!text || !language) {
      throw new Error('Text and language are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create system prompt for different languages
    let systemPrompt = '';
    switch (language) {
      case 'telugu':
        systemPrompt = 'You are a helpful tour guide. Translate the following text to Telugu and provide a natural, conversational narration suitable for audio playback.';
        break;
      case 'hindi':
        systemPrompt = 'You are a helpful tour guide. Translate the following text to Hindi and provide a natural, conversational narration suitable for audio playback.';
        break;
      case 'english':
        systemPrompt = 'You are a helpful tour guide. Provide a natural, conversational narration of the following text suitable for audio playback.';
        break;
      default:
        throw new Error('Invalid language specified');
    }

    // Use Lovable AI to generate translated text
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate audio text');
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;

    console.log('Translation successful for', language);

    return new Response(
      JSON.stringify({ 
        translatedText,
        language 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
