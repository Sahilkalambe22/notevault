const mongoose = require("mongoose");

const connectToMongo = async () => {
	const mongoURL = process.env.MONGO_URI;

	if (!mongoURL) {
		throw new Error("❌ MONGO_URI is undefined. Check .env file.");
	}

	try {
		await mongoose.connect(mongoURL, {
			maxPoolSize: 10, // Limits concurrent DB connections
			serverSelectionTimeoutMS: 5000, // Prevents hanging if DB unreachable
		});

		console.log("✅ MongoDB Connected Successfully");
	} catch (error) {
		console.error("❌ MongoDB connection failed:", error.message);
		process.exit(1); // Stop server if DB fails
	}
};

module.exports = connectToMongo;
