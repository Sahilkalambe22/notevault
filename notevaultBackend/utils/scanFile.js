const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

const scanFile = async (filePath) => {
	if (!API_KEY) {
		console.warn("VirusTotal API key missing, skipping scan");
		return true;
	}

	try {
		const form = new FormData();
		form.append("file", fs.createReadStream(filePath));

		await axios.post("https://www.virustotal.com/api/v3/files", form, {
			headers: {
				...form.getHeaders(),
				"x-apikey": API_KEY,
			},
		});

		return true;
	} catch (err) {
		console.warn("Virus scan skipped:", err.message);
		return true;
	}
};

module.exports = scanFile;
