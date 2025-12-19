
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Incident, VenueSection } from "../types";

/**
 * Utility to extract clean JSON string from potential Gemini markdown wrappers.
 */
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : text.trim();
}

export const geminiService = {
  /**
   * Generates a tactical safety response for a reported incident.
   * Uses Gemini 3 Pro for complex reasoning.
   */
  async analyzeSafety(incident: Partial<Incident>, currentSections: VenueSection[]): Promise<AIResponse> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      As a world-class venue safety AI, provide a tactical response for this incident:
      Incident: ${JSON.stringify(incident)}
      Current Venue Status: ${JSON.stringify(currentSections)}
      
      Output MUST be valid JSON matching this schema:
      {
        "priority": "Critical" | "High" | "Medium" | "Low",
        "actions": ["Step 1", "Step 2", ...],
        "suggestedRoute": "Brief description of evacuation path",
        "riskAssessment": "Strategic analysis of the threat"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING },
              actions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              suggestedRoute: { type: Type.STRING },
              riskAssessment: { type: Type.STRING }
            },
            required: ["priority", "actions", "riskAssessment"]
          }
        }
      });

      const cleanJson = response.text || '{}';
      return JSON.parse(extractJson(cleanJson));
    } catch (e) {
      console.error("Gemini Safety Analysis failed:", e);
      return {
        priority: "High (Fallback)",
        actions: ["Initiate standard emergency protocols", "Dispatch nearest security unit", "Maintain verbal communication with site"],
        riskAssessment: "Automated analysis unavailable. Please proceed with manual triage."
      };
    }
  },

  /**
   * Generates a brief safety insight based on crowd density.
   */
  async getCrowdFlowInsights(sections: VenueSection[]): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "AI services temporarily offline.";

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Provide a single, professional 15-word safety directive based on this venue data: ${JSON.stringify(sections)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "Monitoring systems active. No anomalies detected.";
    } catch (err) {
      console.error("Gemini Insight failed:", err);
      return "Local monitoring active. External AI insights currently offline.";
    }
  },

  /**
   * Estimates the number of people in a provided image.
   * Optimized prompt for counting precision.
   */
  async countPeopleInImage(base64Image: string): Promise<number> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return 0;

    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            { text: "Examine this security feed. Count the total number of distinct individuals. Respond with ONLY the numeric count. If no people are present, respond with 0." },
          ],
        },
      });
      
      const text = response.text?.trim() || "0";
      // Extract the first sequence of numbers found in the text to be safe
      const numbersOnly = text.match(/\d+/);
      const count = numbersOnly ? parseInt(numbersOnly[0], 10) : 0;
      
      console.debug(`AI Count Result for feed: ${count} (Raw: ${text})`);
      return isNaN(count) ? 0 : count;
    } catch (err) {
      console.error("Gemini Visual Count failed:", err);
      return 0;
    }
  }
};
