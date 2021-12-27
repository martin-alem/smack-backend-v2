import mongoose from "mongoose";

async function connectToDatabase() {
  const options = { keepAlive: true, keepAliveInitialDelay: 300000 };
  const url: string = process.env.DB_URL || "";
  try {
    mongoose.connection.on("connecting", () => console.log("Connecting to Mongodb..."));
    mongoose.connection.on("connected", () =>
      console.log("Connected to Smack Database successfully")
    );
    return await mongoose.connect(url, options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectToDatabase;
