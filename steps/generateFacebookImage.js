import { GoogleGenAI } from "@google/genai";
import { uploadToGCS } from "../helpers/uploadToGCS.js";
import { extractHeadline } from "../helpers/extractHeadline.js";

// Initialize the SDK
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateFacebookImage(caption) {
  const key = "Facebook Image";
  console.log(`Starting ${key} Generation...`);

  // 1. Text extraction
  const headline = await extractHeadline(caption, "Facebook");
  console.log(`Headline for FB: "${headline}"`);

  // 2. Setup Timer
  const timer = setInterval(() => {
    console.log(`...still waiting for Gemini Image API on ${key} (30s elapsed)...`);
  }, 30000);

  try {
    const prompt = `
Create a high-engagement Facebook feed graphic designed to visually reinforce the message of the caption provided below. 
Use the caption to determine the emotional tone, the core statement, and the key phrase to feature as a bold headline on the graphic.

DO NOT use the full caption as text — extract the strongest idea or punchline and convert it into a visually dominant headline.

Design style:
- Authentic, relatable, strong message-driven layout
- Horizontal or square orientation (1200x1200 or 1200x630)
- Clear, readable typography with conversational tone
- Balanced spacing, structured layout, not chaotic
- Softer emotional aesthetic compared to Instagram: more human, story-based, “real life” energy
- Use subtle textures, gradients, or abstract shapes as background
- Color palette should support mood (confidence, challenge, inspiration, realism)
- No corporate stock photos, no cheesy icons, no staged business imagery
- Clean and approachable, not overly designed

Purpose:
- Spark discussion and emotional connection
- Encourage readers to stop scrolling and reflect on the message

Input: "${headline}"

Output:
A Facebook-optimized graphic including a dominant headline extracted from the caption, visually designed to feel authentic and relatable, formatted to maximize conversation and sharing.
`;

    const textPart = { text: prompt };

    // 3. Configuration (Matches your reference architecture)
    const config = {
      imageConfig: {
        aspectRatio: "1:1", // Facebook Square
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

    // 4. SDK Call
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ role: "user", parts: [textPart] }],
      config: config
    });

    // 5. Response Handling
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error(`No image generated for ${key}. Response: ${JSON.stringify(response)}`);
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const filename = `fb_img_${Date.now()}.png`;

    // 6. Upload
    return await uploadToGCS(imageBuffer, filename);

  } catch (error) {
    console.error(`Failed to generate ${key}:`, error);
    throw error;
  } finally {
    clearInterval(timer);
  }
}
