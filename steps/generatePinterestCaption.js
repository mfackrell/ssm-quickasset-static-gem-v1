import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePinterestCaption(topic) {
  console.log(`Generating Pinterest Title & Caption for topic: "${topic}"`);

  const systemPrompt = `
Write a Pinterest caption designed for high saves, shares, and search discovery.

The output cannot exceed 450 characters.

You output JSON only.
Your goal is to create two distinct assets:
1. A **Pinterest Title**: High click-through rate, SEO-friendly, short (under 100 chars).
2. A **Pinterest Caption**: Emotional, reflective, under 450 characters.
`;

  const userPrompt = `
TOPIC: ${topic}

STYLE + TONE:
- Inspirational, practical, aesthetic, motivational-but-actionable
- Clean, organized language
- Keyword-rich for Pinterest SEO
- Skimmable formatting with short lines and emoji accents
- Feels like a mini-guide, checklist, or blueprint
- Clear value and fast clarity

STRUCTURE REQUIREMENTS:
- Strong curiosity-driving headline as the first line (optimized for search + saves)
- 3–7 short actionable insights, ideas, or steps related to the topic
- Light use of emojis that match Pinterest’s aesthetic vibe (✨📌🌿💡📍)
- Clear takeaway or motivation
- CTA inviting users to Save or Try it
- Add 10–20 keyword-based Pinterest hashtags at the bottom

DO NOT:
- Do not write like Instagram or Facebook
- Do not write a rant or opinion piece
- Do not write a short response
- Do not use labels like “Output” or “Caption:”
- Do not explain what you are doing

REQUIREMENTS:
1. Analyze the INPUT HEADLINE to identify the specific digital asset and audience implied (e.g., if it mentions "CAD Blocks," the asset is CAD Blocks and the audience is Architects).
2. Write a Pinterest Description (MAX 450 CHARACTERS) optimized for search.

STRUCTURE:
1. The SEO Hook: Clearly state the specific asset name at the very beginning. (e.g., "Standard Residential CAD Block Library.")
2. The Value: A quick sentence on why this file is valuable. ("Stop redrawing the same furniture.")
3. The Monetization Angle: Subtly imply they can sell it. ("Turn your digital files into income.")
4. Keywords: Weave 3-5 high-volume search terms naturally into the sentences.
5. Hashtags: End with 5-8 relevant hashtags.

CRITICAL CONSTRAINT:
- The TOTAL output (including hashtags) MUST be under 450 characters. Pinterest will truncate anything longer.

TONE:
- Helpful, searchable, clear.
- Use calm emojis (📂, 💾, ✨).
- NO "Hustle" language.

Output ONLY the description text.
1. **TITLE**: 
- Must be "Pinterest Friendly" (e.g., "5 Signs You...", "Why You Feel...", "The Hidden Pattern of...").
- Short, punchy, clear text overlay style.

2. **CAPTION**:
- **Strict Limit:** Under 450 characters total.
- **Structure:** - Hook (1-2 sentences).
  - Short reflection on internal shifts.
  - Gentle realization (don't name "abuse" until the end).
  - 1 Reflective Question.
- No "Title:" or labels inside the caption text.
- No step lists.

OUTPUT FORMAT (JSON):
{
  "title": "The generated title here",
  "caption": "The generated caption text here"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Forces structured output
      temperature: 0.7, 
    });

    // Parse the JSON string back into a JavaScript Object
    const responseData = JSON.parse(completion.choices[0].message.content);

    // --- LOGGING ---
    console.log("\n=== PINTEREST RESPONSE START ===");
    console.log("TITLE: " + responseData.title);
    console.log("CAPTION: " + responseData.caption);
    console.log("=== PINTEREST RESPONSE END ===\n");
    // --------------
    
    return responseData; // Returns { title, caption }

  } catch (error) {
    console.error("Error generating Pinterest content:", error);
    throw new Error("Failed to generate Pinterest content.");
  }
}
