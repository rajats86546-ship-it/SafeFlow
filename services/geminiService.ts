
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Incident, VenueSection } from "../types";

export const geminiService = {
  async analyzeSafety(incident: Partial<Incident>, currentSections: VenueSection[]): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      As a venue safety AI expert, analyze this incident at a high-density event:
      Incident: ${JSON.stringify(incident)}
      Current Venue Status: ${JSON.stringify(currentSections)}
      
      Provide a structured response containing:
      1. Immediate priority level (Critical/High/Medium/Low).
      2. 3-5 specific, actionable steps for the safety team.
      3. Suggested evacuation routes or flow adjustments.
      4. A brief risk assessment explaining potential escalation paths.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    try {
      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return {
        priority: "Unknown",
        actions: ["Dispatch personnel to location", "Clear communication channels"],
        riskAssessment: "Unable to process full assessment at this time."
      };
    }
  },

  async getCrowdFlowInsights(sections: VenueSection[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the following crowd density data and provide a concise (2-sentence) professional safety insight: ${JSON.stringify(sections)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Status normal. Continue monitoring.";
  },

  async countPeopleInImage(base64Image: string): Promise<number> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: "Estimate the total number of people visible in this venue security camera feed. Return ONLY a single integer representing the count. If unsure, provide your best guess." },
      ],
    });
    
    const text = response.text?.trim() || "0";
    const count = parseInt(text.replace(/[^0-9]/g, ""), 10);
    return isNaN(count) ? 0 : count;
  }
};
