import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function generateAIContent(userData: any, lang: string) {
  const personality = userData.mood < 4 ? 'Gentle' : (userData.completion < 0.3 ? 'Wake-up' : 'Booster');
  const prompt = `You are a life coach & music curator. Style: ${personality}. Lang: ${lang}. 
                  Context: User recorded a mood of ${userData.mood}/10. 
                  Note: "${userData.note || 'No note provided'}".
                  Habit completion today: ${userData.completion * 100}%.
                  
                  Tasks: 
                  1. Short Insight (<100 words) about their day. 
                  2. Short Quote (<15 words) to inspire them. 
                  3. 3 Songs that perfectly match this mood and the specific keywords in their note.
                  Return strictly JSON: { "insight": "...", "quote": "...", "music": [{ "title": "...", "artist": "...", "reason": "..." }] }`;
  
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
        { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON.' },
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
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  try {
    const { lang = 'zh-CN', userData } = await req.json();
    const aiResult = await generateAIContent(userData, lang);

    // Cache the result in daily_status
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_status').upsert({
      user_id: user.id,
      date: today,
      lang,
      quote_content: aiResult.quote,
      quote_source: 'ai',
      is_insight_ready: true,
      ai_personality: userData.mood < 4 ? 'Gentle' : 'Booster'
    });

    return new Response(JSON.stringify(aiResult), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})
