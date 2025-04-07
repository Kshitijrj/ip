import dbConnect from "../../lib/mongodb";
import Visit from "../../models/Visit";
import Settings from "../../models/Settings"; // Add this
import requestIp from "request-ip";

export default async function handler(req, res) {
  await dbConnect();

  // Fetch fixedcount from DB
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ fixedcount: 20 }); // default if not set
  }
  const fixedcount = settings.fixedcount;

  let ip =
    requestIp.getClientIp(req) ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress;

  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "203.0.113.1";
  }

  if (!ip) {
    return res.status(400).json({ message: "IP not found. Cannot store in DB." });
  }

  if (req.method === "GET") {
    try {
      const { date } = req.query;
      let query = {};

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }

      const visit = await Visit.find(query);
      return res.status(200).json(visit);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { captchaToken } = req.body;
      let visit = await Visit.findOne({ ip });
      const half = Math.floor(fixedcount / 2);
const threeFourth = Math.floor((3 * fixedcount) / 4);
      if (!visit) {
        visit = new Visit({ ip, count: 1, requiresCaptcha: 0 });
      } else {
        visit.count += 1;

        if ((visit.count === half || visit.count === threeFourth) && !captchaToken) {
          visit.requiresCaptcha += 1;
          await visit.save();
          return res.status(403).json({
            error: "CAPTCHA required!",
            requiresCaptcha: true,
            clickCount: visit.count,
          });
        }

        if (visit.count >= fixedcount) {
          await visit.save();
          return res.status(200).json({
            message: "You have reached the maximum limit of clicks",
            requiresCaptcha: false,
            maxlimit: fixedcount,
            clickCount: visit.count,
          });
        }
      }

      visit.updatedAt = new Date();
      await visit.save();

      return res.status(200).json({
        clickCount: visit.count,
        requiresCaptcha: (visit.count === half || visit.count === threeFourth),
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
