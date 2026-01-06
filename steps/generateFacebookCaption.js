import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFacebookCaption(topic) {
  console.log(`Generating Facebook caption for topic: "${topic}"`);

  // 1. Define the Persona
  const systemPrompt = `
Write a high-engagement organic Facebook post designed to generate strong comment activity, emotional connection, and community discussion.

VOICE + TONE:
- Raw, honest, bold, opinionated, human, conversational
- Uses storytelling structure, pacing, and emotional contrast
- Mix of vulnerability, humor, and hard truth
- Uses light emojis for emphasis (🔥💀😤📈⚡️🙌) but not spammy
- Speak like a real person, not a marketer

STRUCTURE REQUIREMENTS:
- Start with a disruptive hook as the first line (controversial, emotional, or unexpected)
- Tell a short story or real-world context around the topic
- Create tension (old belief vs new truth, problem vs realization)
- Make a strong point or lesson that connects emotionally
- Challenge the reader with a direct question designed to spark comments
- Include a CTA that invites discussion or sharing of opinions
- End with 5–10 relevant hashtags
`;

  // 2. Define the Task (User Prompt) - This was missing in your code
  const userPrompt = `
  INPUT TOPIC = ${topic}
DO NOT:
- Do not write like a corporate blog or inspirational poster
- Do not produce a short answer
- Do not include labels like “Output” or “Post:”
- Do not explain what you are doing
- Do not speak in bullet points — use flowing paragraph structure and pacing

OUTPUT FORMAT:
Write only the Facebook post, fully formatted with breaks, pacing, and emojis.
Nothing else.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }, // Now valid because userPrompt is defined
      ],
      temperature: 0.7, 
    });

    const caption = completion.choices[0].message.content;
    
    // --- LOGGING THE RESPONSE ---
    console.log("\n=== FACEBOOK RESPONSE START ===");
    console.log(caption);
    console.log("=== FACEBOOK RESPONSE END ===\n");
    // ----------------------------    
    return caption;

  } catch (error) {
    console.error("Error generating Facebook caption:", error);
    throw new Error("Failed to generate Facebook caption.");
  }
}
