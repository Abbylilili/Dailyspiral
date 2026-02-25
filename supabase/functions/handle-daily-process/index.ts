import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function generateAIContent(userData: any, lang: string) {
  const personality = userData.mood < 4 ? 'Gentle' : (userData.completion < 0.3 ? 'Wake-up' : 'Booster');
  const prompt = `You are a life coach. Style: ${personality}. Lang: ${lang}. 
                  Yesterday Data: ${JSON.stringify(userData)}. 
                  Tasks: 1. Short Insight (<100 words). 2. Short Quote (<15 words). 
                  Return JSON: { insight: string, quote: string }`;
  
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('No authorization header', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { lang = 'zh-CN', userData = { mood: 5, completion: 0.5 } } = await req.json();
    
    // Check cache first
    const today = new Date().toISOString().split('T')[0];
    const { data: cache } = await supabase
      .from('daily_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (cache && cache.quote_content) {
      return new Response(JSON.stringify(cache), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const aiResult = await generateAIContent(userData, lang);
    const personality = userData.mood < 4 ? 'Gentle' : (userData.completion < 0.3 ? 'Wake-up' : 'Booster');

    const dailyStatus = {
      user_id: user.id,
      date: today,
      lang,
      quote_content: aiResult.quote,
      quote_source: 'ai',
      is_insight_ready: true,
      ai_personality: personality
    };

    // Store in DB
    await supabase.from('daily_status').upsert(dailyStatus);

    return new Response(JSON.stringify({ ...dailyStatus, insight: aiResult.insight }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
})
