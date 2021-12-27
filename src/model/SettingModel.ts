import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  settings: {
    twoFA: { type: Boolean, required: false, default: false },
    hideStatus: { type: Boolean, required: false, default: false },
    hidePicture: { type: Boolean, required: false, default: false },
    hideReadReceipt: { type: Boolean, required: false, default: false },
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
});

const Setting = mongoose.model("Setting", SettingSchema);

export default Setting;
