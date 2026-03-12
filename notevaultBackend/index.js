require("dotenv").config({
	path: require("path").join(__dirname, ".env"),
});
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

require("./utils/reminderWorker");

const app = express();
const port = 5000;
const path = require("path");

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/notes/ocr", require("./routes/ocr"));
app.use("/api/notes/ai-suggest", require("./routes/aiSuggest"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(port, () => {
	console.log(`notevault backend listening at http://localhost:${port}`);
});

connectToMongo();
