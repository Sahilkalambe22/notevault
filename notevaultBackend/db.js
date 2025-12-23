const mongoose = require("mongoose");

const connectToMongo = async () => {
  const mongoURL = process.env.MONGO_URI;

  if (!mongoURL) {
    throw new Error("❌ MONGO_URI is undefined. Check .env file.");
  }

  await mongoose.connect(mongoURL);
  console.log("MongoDB Connected Successfully");
};

module.exports = connectToMongo;
