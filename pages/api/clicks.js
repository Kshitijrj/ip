import dbConnect from "../../lib/mongodb";
import Visit from "../../models/Visit";
import requestIp from "request-ip";

export default async function handler(req, res) {
  await dbConnect(); // Ensure DB connection
const fixedcount=20;
  // Extract IP Address
  let ip =
    requestIp.getClientIp(req) ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress;

  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "203.0.113.1"; // Mock IP for local testing
  }

  console.log("✅ Final Extracted IP:", ip);

  if (!ip) {
    return res.status(400).json({ message: "IP not found. Cannot store in DB." });
  }

  if (req.method === "GET") {
    try {
      const visit = await Visit.find();

      if (!visit) {
        return res.status(200).json({ clickCount: 0, requiresCaptcha: false });
      }
      return res.status(200).json(visit);
    } catch (error) {
      console.error("❌ Error fetching visits:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  if (req.method === "POST") {
    try {
      console.log("📌 Received POST request from IP:", ip);
      console.log("📌 Request Body:", req.body);
  
      const { captchaToken } = req.body; // Get CAPTCHA token from request
      let visit = await Visit.findOne({ ip });
  
      if (!visit) {
        visit = new Visit({ ip, count: 1, requiresCaptcha: 0 });
      } else {
        visit.count += 1;
  
        if (visit.count === fixedcount/2 && !captchaToken) {
          visit.requiresCaptcha += 1;
          await visit.save();
          console.log("⚠️ CAPTCHA required for:", ip);
          return res.status(403).json({ 
            error: "CAPTCHA required!", 
            requiresCaptcha: true, 
            clickCount: visit.count // Include clickCount to avoid empty response
          });
        }
        if(visit.count>=fixedcount){
         await visit.save();
          return res.status(200).json({ 
            message: "You have reached the maximum limit of clicks", 
            requiresCaptcha: false, 
            maxlimit:fixedcount,
            clickCount: visit.count // Include clickCount to avoid empty response
          });
        }
        
      }
  
      visit.updatedAt = new Date(); // Update timestamp
      await visit.save();
  
      console.log(`✅ Updated Count for ${ip}: ${visit.count}`);
      
      return res.status(200).json({
        clickCount: visit.count,
        requiresCaptcha: visit.count===fixedcount/2 ? true :false,
      });
  
    } catch (error) {
      console.error("❌ Error tracking visit:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
  

  return res.status(405).json({ message: "Method not allowed" });
}
