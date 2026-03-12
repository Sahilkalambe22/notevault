const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

if (!API_KEY) {
	throw new Error("VIRUSTOTAL_API_KEY not defined");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scanFile = async (filePath) => {
	const form = new FormData();
	form.append("file", fs.createReadStream(filePath));

	// Step 1 — Upload file
	const uploadResponse = await axios.post("https://www.virustotal.com/api/v3/files", form, {
		headers: {
			...form.getHeaders(),
			"x-apikey": API_KEY,
		},
	});

	const analysisId = uploadResponse.data.data.id;

	// Step 2 — Poll analysis result
	for (let i = 0; i < 10; i++) {
		await delay(3000); // wait 3 seconds

		const analysisResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
			headers: {
				"x-apikey": API_KEY,
			},
		});

		const analysis = analysisResponse.data.data.attributes;

		if (analysis.status === "completed") {
			const stats = analysis.stats;

			if (stats.malicious > 0 || stats.suspicious > 0) {
				throw new Error("Malicious file detected");
			}

			return true;
		}
	}

	throw new Error("Virus scan timeout");
};

module.exports = scanFile;
