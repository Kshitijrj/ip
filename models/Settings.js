import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  fixedcount: {
    type: Number,
    default: 20,
  },
});

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
