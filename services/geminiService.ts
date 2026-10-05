
import { GoogleGenAI, Type } from "@google/genai";
import { LoadingEntry } from "../types";

export class GeminiService {
  // Fix: Initializing GoogleGenAI according to the guidelines
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeLoadingData(data: LoadingEntry[]) {
    const ai = this.getClient();
    const prompt = `Analyze the following rice export loading data and provide insights on loading efficiency, common deductions, and any financial anomalies. 
    Data Summary: ${JSON.stringify(data.map(d => ({ vh: d.vhNo, netAmt: d.netAmt, deductions: d.otherDed, qty: d.qtyTon })))}
    Provide a concise report with key metrics and suggestions.`;

    try {
      // Fix: Using correct method call for generateContent
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a senior logistics and finance analyst for a rice export firm. Provide professional, data-driven insights.",
        },
      });
      // Fix: Directly accessing .text property (not a method)
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to analyze data at this time. Please check your connection.";
    }
  }

  async getCalculationsForEntry(partialEntry: Partial<LoadingEntry>) {
    const ai = this.getClient();
    // This could also be done locally, but using Gemini for complex scenarios
    const prompt = `Calculate the financial breakdown for a rice loading entry:
    Rate: ${partialEntry.rate}
    Qty (Tons): ${partialEntry.qtyTon}
    Bags: ${partialEntry.bags}
    Bag Wt (Grams): ${partialEntry.bagsWtGrams}
    Other Ded: ${partialEntry.otherDedAmt || 0}
    TDS Rate: 0.1%
    
    Formula: 
    1. Amount = Qty * Rate
    2. Bag Wt Ded = (Bags * Bag Wt in Grams / 1000) * (Rate / 1000)
    3. Gross Amt = Amount - Bag Wt Ded
    4. TDS = 0.1% of Gross Amt
    5. Net Amt = Gross Amt - TDS - Other Ded
    
    Return as JSON.`;

    try {
      // Fix: Using correct method call for generateContent with JSON schema
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              bagsWtDedAmt: { type: Type.NUMBER },
              grossAmt: { type: Type.NUMBER },
              tdsAmount: { type: Type.NUMBER },
              netAmt: { type: Type.NUMBER },
            },
            required: ['amount', 'bagsWtDedAmt', 'grossAmt', 'tdsAmount', 'netAmt']
          }
        }
      });
      // Fix: Directly accessing .text property (not a method)
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Calculation Error:", error);
      return null;
    }
  }

  async extractTemplateFromImage(base64Image: string, mimeType: string) {
    const ai = this.getClient();
    const prompt = `Analyze this invoice template image and extract its layout as a list of blocks for a template builder.
    The canvas size is 800x1131.
    Each block should have:
    - id: unique string
    - type: 'text' | 'table' | 'label' | 'box'
    - content: the text in the block (use {{placeholder}} for dynamic fields like invoiceNo, invoiceDate, scNo, consignee, notifyParty1, notifyParty2, notifyParty3, notifyParty4, notifyParty5, preCarriageBy, preCarrier, vesselVoyage, portOfDischarge, originCountry, portOfLoading, paymentTerms, finalDestination, blNo, incoterms, sbNo, itemName, quantity, rate, amount, amountInWords, bankName, branchName, accountNo, swiftCode, ifscCode, hsCode, fobRate, freightRate, insuranceRate, commission, cif, countryOfFinalDestination)
    - x, y: coordinates (0-800 for x, 0-1131 for y)
    - width, height: dimensions
    - fontSize (usually 7-14), fontWeight ('bold', 'black', 'normal'), textAlign ('left', 'center', 'right'), color, backgroundColor, border (e.g. '1px solid #0369a1'), padding
    
    Return as a JSON array of blocks. Be precise with coordinates to match the image layout.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image, mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['text', 'table', 'label', 'box'] },
                content: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                fontSize: { type: Type.NUMBER },
                fontWeight: { type: Type.STRING },
                textAlign: { type: Type.STRING },
                color: { type: Type.STRING },
                backgroundColor: { type: Type.STRING },
                border: { type: Type.STRING },
                padding: { type: Type.NUMBER }
              },
              required: ['id', 'type', 'content', 'x', 'y', 'width', 'height', 'fontSize']
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Vision Error:", error);
      return [];
    }
  }
}
