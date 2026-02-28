import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: string;
  parts: Array<{ text: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contents } = await req.json();

    if (!contents || !Array.isArray(contents)) {
      throw new Error('Invalid request: contents array is required');
    }

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const apiUrl = 'https://app-9xp25u4ctp1d-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    let fullResponse = '';
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === '[DONE]') continue;
            
            const data = JSON.parse(jsonStr);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              fullResponse += data.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ response: fullResponse }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
