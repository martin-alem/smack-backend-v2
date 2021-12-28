import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  numberOfVerifications: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
});

const Verification = mongoose.model("verification", VerificationSchema);

export default Verification;
