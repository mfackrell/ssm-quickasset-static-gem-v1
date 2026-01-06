import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInstagramCaption(topic) {
  console.log(`Generating Instagram caption for topic: "${topic}"`);

  const systemPrompt = `
Write an Instagram Static Post caption designed to maximize comments, shares, saves, emotional reaction, and watch time.

VOICE + TONE:
- Aggressive, polarizing, raw, punchy, and direct.
- Call out bullshit excuses and force action.
- Conversational, spoken-aloud style.
- Use heavy rhythm and spacing.
- Use emojis for emphasis (🔥💀🚀⚡️😤📉📈).
- Zero paragraphs. Zero essay tone. No filler. No safe language.

STRUCTURE REQUIREMENTS:
- Brutal first-line hook that punches the viewer in the face.
- Very short lines (1–7 words each).
- Lots of whitespace line breaks for pacing.
- Pattern interrupts and emotional tension.
- At least one challenge question to trigger comments.
- Clear CTA to comment or share.
- End with 12–18 relevant IG hashtags.
`;

  const userPrompt = `
The audience is intelligent and intuitive but conditioned to doubt themselves. They are scrolling quickly. You must catch them immediately.

TOPIC: ${topic}

DO NOT:
- Do not write meta labels like “Output:” or “Caption:”.
- Do not explain what you are doing.
- Do not produce short or test-mode responses.
- Do not sound corporate or motivational-poster inspirational.
- Do not compress or simplify the response.

OUTPUT FORMAT:
Write only the caption with full line breaks and emojis. Nothing else.


GENERATE NOW.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0, 
    });

    const caption = completion.choices[0].message.content;

    // --- LOGGING THE RESPONSE ---
    console.log("\n=== INSTAGRAM RESPONSE START ===");
    console.log(caption);
    console.log("=== INSTAGRAM RESPONSE END ===\n");
    // ----------------------------
    
    return caption;

  } catch (error) {
    console.error("Error generating Instagram caption:", error);
    throw new Error("Failed to generate Instagram caption.");
  }
}
