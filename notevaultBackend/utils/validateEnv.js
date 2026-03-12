const requiredEnv = ["JWT_SECRET", "MONGO_URI", "EMAIL_USER", "EMAIL_PASS", "VIRUSTOTAL_API_KEY"];

const validateEnv = () => {
	const missing = requiredEnv.filter((env) => !process.env[env]);

	if (missing.length > 0) {
		console.error("❌ Missing environment variables:");
		missing.forEach((v) => console.error(` - ${v}`));

		process.exit(1);
	}

	console.log("✅ Environment variables validated");
};

module.exports = validateEnv;
