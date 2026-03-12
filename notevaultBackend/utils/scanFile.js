const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

if (!API_KEY) {
	throw new Error("VIRUSTOTAL_API_KEY not defined");
}

const scanFile = async (filePath) => {
	const form = new FormData();
	form.append("file", fs.createReadStream(filePath));

	const response = await axios.post("https://www.virustotal.com/api/v3/files", form, {
		headers: {
			...form.getHeaders(),
			"x-apikey": API_KEY,
		},
	});

	return response.data;
};

module.exports = scanFile;
