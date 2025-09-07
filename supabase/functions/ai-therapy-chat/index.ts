import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], biometricData = null } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing wellness chat request:', { message, hasBiometrics: !!biometricData });

    // Enhanced system prompt for university student wellness
    const systemPrompt = `You are Avira AI, a compassionate wellness assistant specifically designed for university students' mental health support. Your role is to:

CORE RESPONSIBILITIES:
1. Analyze smartwatch/biometric data for signs of stress, anxiety, or fatigue
2. Suggest safe, non-medical interventions like breathing exercises, meditation, movement, hydration, sleep hygiene
3. Provide emotional support in a friendly, non-judgmental way (like a digital companion)
4. Encourage professional help if data or responses suggest severe distress or crisis
5. NEVER prescribe medicines - only suggest lifestyle and wellness practices

WELLNESS INTERVENTIONS YOU CAN SUGGEST:
• Breathing exercises (4-7-8 technique, box breathing)
• Grounding techniques (5-4-3-2-1 sensory method)
• Short meditation or relaxation breaks
• Gentle movement, stretching, or walking
• Hydration and nutrition reminders
• Sleep hygiene tips
• CBT-style reflection questions
• Journaling prompts

BIOMETRIC DATA ANALYSIS:
When users share smartwatch data, analyze for patterns indicating:
- High stress (elevated heart rate, low HRV)
- Poor sleep quality
- Low activity levels
- Irregular patterns

CRISIS DETECTION:
If responses suggest severe mental health crisis, suicidal ideation, or serious health risks, immediately encourage seeking professional help, crisis hotlines, or emergency services.

COMMUNICATION STYLE:
- Warm, empathetic, and non-judgmental
- Use university student-friendly language
- Provide practical, actionable advice
- Be encouraging and supportive
- Acknowledge the unique stressors of student life (exams, deadlines, social pressures)

Remember: You provide supportive guidance but are NOT a replacement for professional mental health care.`;

    // Prepare the user message with biometric context if available
    let userMessageContent = message;
    if (biometricData) {
      userMessageContent = `${message}

[BIOMETRIC DATA FROM SMARTWATCH]:
- Heart Rate: ${biometricData.heartRate} BPM
- Blood Oxygen: ${biometricData.oxygenLevel}%
- Stress Level: ${biometricData.stressLevel}%
- Sleep Quality: ${biometricData.sleepQuality}%
- Steps Today: ${biometricData.steps}
- Body Temperature: ${biometricData.temperature}°F
- Timestamp: ${biometricData.timestamp}

Please analyze this biometric data and provide personalized wellness recommendations.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessageContent }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_completion_tokens: 1000,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI wellness response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: crypto.randomUUID()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-therapy-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: 'Please try again or contact support if the issue persists'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});