import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    requiresCaptcha: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Visit = mongoose.models.Visit || mongoose.model("Visit", VisitSchema);

export default Visit;
