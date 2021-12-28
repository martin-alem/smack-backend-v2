import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  story: {
    type: String,
    required: false,
    default: "",
  },
  phoneNumber: {
    type: String,
    required: false,
    default: "",
  },
  twoFA: {
    lastLoggedIn: {
      type: Date,
      required: false,
      default: new Date("January 1 1970 00:00:00"),
    },
    devices: {
      type: [],
      required: false,
    },
  },
  dateJoined: {
    type: Date,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
