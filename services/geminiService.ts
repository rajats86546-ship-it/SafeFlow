
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
   * Uses Gemini 3 Pro for advanced reasoning and high-quality response.
   */
  async analyzeSafety(incident: Partial<Incident>, currentSections: VenueSection[]): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Tactical Incident Report:
      Incident: ${JSON.stringify(incident)}
      Venue Status: ${JSON.stringify(currentSections)}
      
      Respond in JSON:
      {
        "priority": "Critical" | "High" | "Medium" | "Low",
        "actions": ["Step 1", "Step 2", ...],
        "suggestedRoute": "Evacuation path string",
        "riskAssessment": "Strategic analysis"
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
      console.error("Safety Analysis Error:", e);
      return {
        priority: "High",
        actions: ["Dispatch local security", "Clear immediate area", "Monitor via surveillance"],
        riskAssessment: "Automated triage unavailable. Standard protocols apply."
      };
    }
  },

  /**
   * Generates a brief safety insight based on crowd density.
   */
  async getCrowdFlowInsights(sections: VenueSection[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Brief 10-word safety directive based on these levels: ${JSON.stringify(sections)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Monitoring active. Systems green.";
    } catch (err) {
      return "Direct surveillance active. Manual monitoring recommended.";
    }
  },

  /**
   * Estimates the number of people in a provided image.
   * Optimized for speed and reliability.
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
            { text: "Count people. Return only number." },
          ],
        },
      });
      
      const rawText = (response.text || "0").trim();
      const match = rawText.match(/\d+/);
      const count = match ? parseInt(match[0], 10) : 0;
      
      return isNaN(count) ? 0 : count;
    } catch (err: any) {
      console.error("Vision Error:", err);
      return 0;
    }
  }
};
