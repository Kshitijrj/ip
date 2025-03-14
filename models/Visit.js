import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }, // Ensure count is a number
  requiresCaptcha: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
