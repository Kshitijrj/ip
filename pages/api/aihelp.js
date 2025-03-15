import dbConnect from "../../lib/mongodb";
import Visit from "../../models/Visit";
import OpenAI from "openai";

// Initialize OpenAI API
const token = process.env["GITHUB_TOKEN"];

export default async function handler(req, res) {
  await dbConnect(); // Ensure DB connection
  
  if (req.method === "POST") {
    const { ip } = req.body;
    if (!ip) {
      return res
        .status(400)
        .json({ message: "IP not found. Cannot store in DB." });
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
const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: token
  });
  const response = await client.chat.completions.create({
    messages: [
        {
          role: "system",
          content: "You are an AI that analyzes user behavior based on visit data.",
        },
        {
          role: "user",
          content: `Analyze the following user behavior data and provide insights:\n${userBehavior}`,
        },
      ],
    model: "gpt-4o",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1
  });
  const analysis = response.choices[0].message.content;

  return res.status(200).json({
    ip: visit.ip,
    count: visit.count,
    requiresCaptcha: visit.requiresCaptcha,
    behaviorAnalysis: analysis, // AI-generated insights
  });
    } catch (error) {
      console.error("❌ Error fetching visits:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
