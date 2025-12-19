
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
          thinkingConfig: { thinkingBudget: 16384 },
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide a single, professional 15-word safety directive based on this venue data: ${JSON.stringify(sections)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      return response.text || "Monitoring systems active. No anomalies detected.";
    } catch (err) {
      console.error("Gemini Insight failed:", err);
      return "Local monitoring active. External AI insights currently offline.";
    }
  },

  /**
   * Estimates the number of people in a provided image.
   * Optimized prompt for counting precision and robust numeric extraction.
   */
  async countPeopleInImage(base64Image: string): Promise<number> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
            { text: "Task: Crowd Detection. Identify every distinct person in this security feed. Look for heads, shoulders, and human silhouettes. Count them carefully. Respond with ONLY the numeric count. If zero people are present, respond with 0. NO TEXT, ONLY THE NUMBER." },
          ],
        },
        config: { 
          thinkingConfig: { thinkingBudget: 2048 } // Small budget to improve counting accuracy
        }
      });
      
      const rawText = (response.text || "0").trim();
      // Extract only digits from the response to handle cases where the AI adds extra text
      const numericMatch = rawText.match(/\d+/);
      const count = numericMatch ? parseInt(numericMatch[0], 10) : 0;
      
      console.debug(`[SafeFlow Vision] Detected Count: ${count} | Raw Response: "${rawText}"`);
      return isNaN(count) ? 0 : count;
    } catch (err) {
      console.error("Gemini Visual Count failed:", err);
      return 0;
    }
  }
};
