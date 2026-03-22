import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, fileName, fileType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!imageUrl) throw new Error("imageUrl is required");

    const systemPrompt = `You are an expert digital forensics analyst specializing in deepfake detection. Analyze the provided image for signs of manipulation or AI generation.

Examine for:
1. Facial inconsistencies: asymmetry, unnatural skin texture, blurred edges around face
2. Lighting anomalies: inconsistent shadows, unnatural reflections, mismatched lighting directions
3. Blending artifacts: visible seams, color mismatches at boundaries, warping near edges
4. Background irregularities: distorted patterns, repeated textures, impossible geometry
5. Eye and teeth anomalies: irregular reflections, misaligned gaze, unnatural teeth
6. Hair and ear artifacts: blurred hairline, missing strands, deformed ears
7. Compression artifacts: unusual JPEG artifacts, inconsistent noise patterns
8. Metadata indicators: signs of AI generation patterns

You MUST respond using the suggest_analysis tool with your findings.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this image for deepfake indicators. File: ${fileName}, Type: ${fileType}` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_analysis",
              description: "Return deepfake analysis results",
              parameters: {
                type: "object",
                properties: {
                  verdict: {
                    type: "string",
                    enum: ["real", "fake", "uncertain"],
                    description: "Overall assessment of whether the image is real, fake/manipulated, or uncertain",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score from 0 to 100",
                  },
                  summary: {
                    type: "string",
                    description: "Brief 1-2 sentence summary of findings",
                  },
                  indicators: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Category of the indicator (e.g., Facial, Lighting, Blending, Background, Eyes, Hair, Compression)" },
                        finding: { type: "string", description: "What was found" },
                        severity: { type: "string", enum: ["none", "low", "medium", "high"], description: "How suspicious this indicator is" },
                      },
                      required: ["category", "finding", "severity"],
                      additionalProperties: false,
                    },
                    description: "List of specific indicators analyzed",
                  },
                },
                required: ["verdict", "confidence", "summary", "indicators"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis results returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-media error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
