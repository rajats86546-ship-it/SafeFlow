
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIResponse, Incident, VenueSection } from "../types";

/**
 * Utility to extract clean JSON string from potential Gemini markdown wrappers.
 */
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : text.trim();
}

/**
 * Handles potential API errors and triggers re-selection if project is missing.
 */
function handleApiError(error: any) {
  console.error("Gemini API Error:", error);
  if (error?.message?.includes("Requested entity was not found")) {
    // This is the specific error mentioned in instructions for invalid/missing projects.
    // Triggering the selection dialog again via a global custom event or handled in UI.
    window.dispatchEvent(new CustomEvent('aistudio:request-key'));
  }
}

export const geminiService = {
  /**
   * Generates a tactical safety response for a reported incident.
   */
  async analyzeSafety(incident: Partial<Incident>, currentSections: VenueSection[]): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      CONTEXT: Venue Command Center. 
      INCIDENT: ${JSON.stringify(incident)}
      STATUS: ${JSON.stringify(currentSections)}
      
      TASK: Return JSON protocol:
      {
        "priority": "Critical" | "High" | "Medium",
        "actions": ["Direct action 1", "Direct action 2"],
        "suggestedRoute": "Specific path string",
        "riskAssessment": "Short technical assessment"
      }
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const cleanJson = response.text ? extractJson(response.text) : '{}';
      return JSON.parse(cleanJson);
    } catch (e) {
      handleApiError(e);
      return {
        priority: "High",
        actions: ["Dispatch local security", "Clear immediate area", "Notify command"],
        riskAssessment: "Automatic inference failed. Proceed with standard operating procedure."
      };
    }
  },

  /**
   * Generates a brief safety insight.
   */
  async getCrowdFlowInsights(sections: VenueSection[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `System Telemetry: ${JSON.stringify(sections)}. Provide a 7-word safety command for the venue manager.`;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text?.trim() || "All systems nominal. Continue monitoring.";
    } catch (err) {
      handleApiError(err);
      return "Relay active. Manual verification suggested.";
    }
  },

  /**
   * Real-time vision inference. 
   */
  async countPeopleInImage(base64Image: string): Promise<number> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
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
      return match ? parseInt(match[0], 10) : 0;
    } catch (err: any) {
      handleApiError(err);
      return 0;
    }
  }
};
