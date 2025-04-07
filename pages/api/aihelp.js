import dbConnect from "../../lib/mongodb";
import Visit from "../../models/Visit";
import OpenAI from "openai";

// Initialize OpenAI API
const token = process.env["GITHUB_TOKEN"];
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

// Enable background functions
export const config = {
  runtime: "nodejs",
  maxDuration: 300, // 5 minutes max
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ message: "IP not found. Cannot store in DB." });
  }

  try {
    const visit = await Visit.findOne({ ip });

    if (!visit) {
      return res.status(200).json({ clickCount: 0, requiresCaptcha: false });
    }

    const userBehavior = `
      User with IP: ${visit.ip}
      - Total Clicks: ${visit.count}
      - CAPTCHA Required: ${visit.requiresCaptcha}
    `;

    // AI Request
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are an AI that analyzes user behavior based on visit data." },
        { role: "user", content: `Analyze the following user behavior data and provide insights:\n${userBehavior}` },
      ],
      model: "gpt-4o-mini",
      max_tokens: 512,
    });

    const analysis = response.choices?.[0]?.message?.content || "No analysis available.";

    return res.status(200).json({
      ip: visit.ip,
      count: visit.count,
      requiresCaptcha: visit.requiresCaptcha,
      behaviorAnalysis: analysis,
    });

  } catch (error) {
    console.error("❌ Error:", error.message || error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
