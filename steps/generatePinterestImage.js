import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generatePinterestImage(pinterestData) {
  const key = "Pinterest Image";
  console.log(`Starting ${key} Generation...`);
  
  const textOverlay = pinterestData.title || "Subtle Recognition"; 

  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a visually compelling Pinterest graphic designed to maximize saves, shares, and search discovery. 
Use the caption provided below to determine the core message and extract the most valuable phrase, insight, or instructional headline. 
Do NOT use the full caption; transform its core idea into a strong, save-worthy headline that can stand alone.

Design style requirements:
- Clean, aesthetic, modern layout with an organized structure
- Vertical format 1000x1500px (2:3 ratio), optimized for Pinterest
- Use soft gradients, light textures, or minimal background patterns that feel premium
- Include subtle, intentional visual elements (lines, shapes, accents) to guide the eye
- Typography should be clear, elegant, and highly readable; balanced hierarchy
- Use a calming, thoughtful visual style vs high-aggression or hype
- Select a color palette that feels modern and inspirational based on the tone of the caption
- No stock photography of people, no clipart, no cheesy icons
- Avoid clutter and excessive effects; design should feel aspirational and actionable

Purpose:
Create a graphic that feels like a mini guide, checklist, or insight worth saving for reference.

Input Caption: "${textOverlay}"
Output:
A Pinterest-optimized image with a strong, save-worthy headline extracted from the caption, laid out in a clean and aesthetic design suitable for high engagement and discovery.

`;

    const config = {
      imageConfig: {
        aspectRatio: "9:16", // Pinterest Tall
      },
      responseModalities: ["IMAGE"],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" }
      ],
      temperature: 0.7
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: config
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error(`No image generated for ${key}.`);
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const filename = `pin_img_${Date.now()}.png`;

    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
