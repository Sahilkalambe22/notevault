const fs = require("fs");

const cleanupUploads = (files = []) => {
  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error("Failed to delete file:", file.path);
    }
  }
};

module.exports = cleanupUploads;