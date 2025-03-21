export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { token } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );
    const data = await response.json();
  
    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  }
  