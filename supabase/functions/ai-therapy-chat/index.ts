import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Get Gemini API key from environment variables
    const geminiApiKey = Deno.env.get('AIzaSyACNmoPMqjo85685s8vnW1yTS21BmqALGc');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please configure your Gemini API key.');
    }

    console.log('Processing wellness chat request:', { 
      message: message.substring(0, 50) + '...', 
      hasBiometrics: !!biometricData,
      historyLength: conversationHistory.length 
    });

    // Enhanced system prompt for university student wellness
    const systemPrompt = `You are Avira AI, a compassionate wellness assistant specifically designed for university students' mental health support. Your role is to:

CORE RESPONSIBILITIES:
1. Analyze smartwatch/biometric data for signs of stress, anxiety, or fatigue
2. Suggest safe, non-medical interventions like breathing exercises, meditation, movement, hydration, sleep hygiene
3. Provide emotional support in a friendly, non-judgmental way (like a digital companion)
4. Encourage professional help if data or responses suggest severe distress or crisis
5. NEVER prescribe medicines - only suggest lifestyle and wellness practices

WELLNESS INTERVENTIONS YOU CAN SUGGEST:
• Breathing exercises (4-7-8 technique, box breathing, coherent breathing)
• Grounding techniques (5-4-3-2-1 sensory method, progressive muscle relaxation)
• Short meditation or mindfulness breaks (1-10 minutes)
• Gentle movement, stretching, yoga, or walking
• Hydration and nutrition reminders
• Sleep hygiene tips and bedtime routines
• CBT-style reflection questions and thought challenging
• Journaling prompts and emotional processing
• Time management and study break strategies
• Social connection and support system activation

BIOMETRIC DATA ANALYSIS:
When users share smartwatch data, analyze for patterns indicating:
- High stress (elevated heart rate >100 BPM at rest, low HRV)
- Poor sleep quality (<70% sleep quality score)
- Low activity levels (<5000 steps per day)
- Temperature variations indicating illness or stress
- Oxygen saturation concerns (<95%)
- Irregular patterns that might indicate anxiety or panic

CRISIS DETECTION:
If responses suggest severe mental health crisis, suicidal ideation, self-harm, or serious health risks, immediately:
- Express genuine concern and validation
- Encourage seeking immediate professional help
- Provide crisis hotline numbers (988 Suicide & Crisis Lifeline in US)
- Suggest campus counseling services or emergency services
- Stay supportive while emphasizing professional help is needed

COMMUNICATION STYLE:
- Warm, empathetic, and non-judgmental
- Use university student-friendly language
- Provide practical, actionable advice
- Be encouraging and supportive
- Acknowledge the unique stressors of student life (exams, deadlines, social pressures, financial stress)
- Ask follow-up questions to better understand their situation
- Celebrate small wins and progress

IMPORTANT DISCLAIMERS:
- You provide supportive guidance but are NOT a replacement for professional mental health care
- Always encourage users to seek professional help for persistent or severe symptoms
- Remind users that biometric data should be discussed with healthcare providers if concerning

Remember to be concise but thorough, practical but caring, and always prioritize user safety.`;

    // Prepare the conversation contents for Gemini API
    const contents = [];
    
    // Add system message as the first user message (Gemini doesn't have system role)
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'm Avira AI, your compassionate wellness assistant for university students. I'm here to provide mental health support, analyze biometric data, and suggest safe wellness interventions. I'll always prioritize your safety and encourage professional help when needed. How can I support your wellbeing today?" }]
    });

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      if (msg.role === 'user') {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }]
        });
      } else if (msg.role === 'assistant' || msg.role === 'model') {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }]
        });
      }
    });

    // Prepare the current user message with biometric context if available
    let userMessageContent = message;
    if (biometricData) {
      const biometricAnalysis = analyzeBiometrics(biometricData);
      userMessageContent = `${message}

[BIOMETRIC DATA FROM SMARTWATCH - ${biometricData.timestamp || 'Current'}]:
- Heart Rate: ${biometricData.heartRate || 'N/A'} BPM
- Blood Oxygen: ${biometricData.oxygenLevel || 'N/A'}%
- Stress Level: ${biometricData.stressLevel || 'N/A'}%
- Sleep Quality: ${biometricData.sleepQuality || 'N/A'}%
- Steps Today: ${biometricData.steps || 'N/A'}
- Body Temperature: ${biometricData.temperature || 'N/A'}°F

${biometricAnalysis}

Please analyze this biometric data alongside my message and provide personalized wellness recommendations.`;
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessageContent }]
    });

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1200,
        candidateCount: 1,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_LOW_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      
      if (response.status === 400) {
        throw new Error('Invalid request to Gemini API. Please check your message format.');
      } else if (response.status === 403) {
        throw new Error('Gemini API key is invalid or quota exceeded.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    
    // Check if response was blocked by safety filters
    if (data.promptFeedback?.blockReason) {
      console.warn('Content blocked by safety filters:', data.promptFeedback.blockReason);
      
      return new Response(JSON.stringify({ 
        response: "I understand you're looking for support. For your safety, I need to be careful with my responses. If you're experiencing a mental health crisis, please reach out to a counselor, call 988 (Suicide & Crisis Lifeline), or visit your campus mental health services. I'm here to support you in safe ways - could you rephrase your message or ask about specific wellness techniques I can help with?",
        conversationId: crypto.randomUUID(),
        blocked: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Extract the AI response
    const candidate = data.candidates?.[0];
    const aiResponse = candidate?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.error('No response generated:', data);
      throw new Error('No response generated from Gemini API. Please try rephrasing your message.');
    }

    // Check if the response was finished successfully
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('Response finished with reason:', candidate.finishReason);
    }

    console.log('AI wellness response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse.trim(),
      conversationId: crypto.randomUUID(),
      finishReason: candidate?.finishReason || 'STOP'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-therapy-chat function:', error);
    
    // Provide more specific error messages
    let errorMessage = 'I apologize, but I encountered a technical issue. Please try again.';
    let statusCode = 500;
    
    if (error.message.includes('API key')) {
      errorMessage = 'There\'s an issue with the API configuration. Please contact support.';
      statusCode = 500;
    } else if (error.message.includes('Rate limit')) {
      errorMessage = 'The service is currently busy. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message.includes('quota')) {
      errorMessage = 'The service is temporarily unavailable. Please try again later.';
      statusCode = 503;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'If this issue continues, please reach out to campus IT support or mental health services directly.',
      technicalError: error.message
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to analyze biometric data
function analyzeBiometrics(data: any): string {
  const insights = [];
  
  if (data.heartRate) {
    if (data.heartRate > 100) {
      insights.push("Your heart rate appears elevated, which could indicate stress or physical activity.");
    } else if (data.heartRate < 60) {
      insights.push("Your heart rate is quite low, which might indicate good fitness or possible fatigue.");
    }
  }
  
  if (data.stressLevel && data.stressLevel > 70) {
    insights.push("Your stress levels appear high based on the biometric data.");
  }
  
  if (data.sleepQuality && data.sleepQuality < 70) {
    insights.push("Your sleep quality seems to need improvement.");
  }
  
  if (data.steps && data.steps < 5000) {
    insights.push("Your activity level today appears lower than recommended.");
  }
  
  if (data.oxygenLevel && data.oxygenLevel < 95) {
    insights.push("Your blood oxygen level is concerning and should be discussed with a healthcare provider.");
  }
  
  return insights.length > 0 
    ? `[BIOMETRIC ANALYSIS]: ${insights.join(' ')}` 
    : "[BIOMETRIC ANALYSIS]: Your biometric readings appear to be within normal ranges.";
}
