import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";
import { extractHeadline } from "../helpers/extractHeadline.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateInstagramImage(caption) {
  const key = "Instagram Image";
  console.log(`Starting ${key} Generation...`);

  const headline = await extractHeadline(caption, "Instagram");
  
  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a bold, high-impact vertical Instagram graphic (1080x1350) designed to stop scrolling and visually reinforce the message of the caption provided below.

Use the caption text as the main design inspiration and convert its core idea into a powerful, emotionally charged visual.
 
Dynamically extract the most impactful short phrase or hook from the caption and use it as the headline text on the graphic.

Design style:
- Modern, clean, high-contrast typography
- Large, dominant headline text readable instantly
- Minimalistic background with texture or subtle gradient
- Bold color palette that conveys urgency and energy
- No stock people, no generic icons, no clip art, no cheesy imagery
- Avoid clutter—hero typography should control the composition
- Use whitespace, layout tension, and creative typography as visual power

Format:
- Vertical 1080x1350 optimized for Instagram feed and Reel cover images
- Visual should feel premium, confident, and disruptive
- Emotion over decoration
- Include light grain or depth if it fits the tone
- No excessive effects, keep it clean and powerful

Input caption (use this to determine message and headline): "${headline}"

Output:
An Instagram-optimized graphic design featuring a bold headline extracted from the caption, with a modern, visually striking layout that grabs attention and communicates the core message immediately.
`;

    const config = {
      imageConfig: {
        aspectRatio: "3:4", // Instagram Vertical
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
    const filename = `ig_img_${Date.now()}.png`;

    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
