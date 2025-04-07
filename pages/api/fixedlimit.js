import dbConnect from "../../lib/mongodb";
import Settings from "../../models/Settings";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { newLimit } = req.body;

    if (!newLimit || newLimit < 1) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    try {
      const updated = await Settings.findOneAndUpdate(
        {},
        { fixedcount: newLimit },
        { upsert: true, new: true }
      );
      return res.status(200).json({ message: "Limit updated", fixedcount: updated.fixedcount });
    } catch (error) {
      return res.status(500).json({ message: "Update failed", error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const settings = await Settings.findOne();
      return res.status(200).json({ fixedcount: settings?.fixedcount || 20 });
    } catch (error) {
      return res.status(500).json({ message: "Fetch failed", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
