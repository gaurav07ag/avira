import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], biometricData = null } =
      await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    console.log("Processing wellness chat request:", {
      message,
      hasBiometrics: !!biometricData,
    });

    // System prompt
    const systemPrompt = `You are Avira AI, a compassionate wellness assistant specifically designed for university students' mental health support.
... (rest of your long system prompt here) ...`;

    // Prepare user message with biometric context
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

    // Convert conversation into Gemini format
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: userMessageContent }],
      },
    ];

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": geminiApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error(Gemini API error: ${response.status});
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    console.log("AI wellness response generated successfully");

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: crypto.randomUUID(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in ai-therapy-chat function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: "Please try again or contact support if the issue persists",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
