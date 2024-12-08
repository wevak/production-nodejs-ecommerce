import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`MongoDB error ${error}`.bgRed.white);
  }
};

export default connectDB;
