import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstances = await mongoose.connect(
      `${process.env.DATABASE_URL}/blog`,
      { autoIndex: true }
    );
    console.log(
      "Database is connected successfully",
      connectionInstances.connection.host
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export { connectDB };
