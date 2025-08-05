import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on(`connected`, () => {
      console.info("MongoDB Connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/QuickBlog`);
  } catch (error) {
    console.error(error.message);
  }
};
export default connectDB;