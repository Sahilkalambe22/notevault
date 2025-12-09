// routes/aiSuggest.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// small rate limiter so someone can't spam your free plan by accident
const limiter = rateLimit({
	windowMs: 1000 * 30, // 30s
	max: 6,
	message: { error: "Too many requests, slow down" },
});

router.use(limiter);

/**
 * Helper: lightweight fallback suggestion generator (no external API).
 * It tries to:
 *  - produce headline (first non-empty short line)
 *  - produce short summary (first 140-200 chars)
 *  - produce 3 bullets (split by sentences and pick top ones)
 *  - produce 2 tags (simple keyword matching)
 */
function localSuggest(text = "", maxBullets = 3) {
	const cleaned = (text || "").replace(/\s+/g, " ").trim();

	// headline: try first 6-10 words
	const headline =
		cleaned
			.split(/[.!\n]/)[0]
			.trim()
			.slice(0, 80) || "Untitled note";

	// summary: first 200 chars
	const summary = cleaned.length <= 200 ? cleaned : cleaned.slice(0, 200).trim() + "...";

	// bullets: split into sentences and pick first N meaningful
	const sentences = cleaned
		.split(/(?<=[.?!])\s+/)
		.map((s) => s.trim())
		.filter(Boolean);
	const bullets = [];
	for (let s of sentences) {
		if (bullets.length >= maxBullets) break;
		if (s.length > 20)
			bullets.push(
				s
					.replace(/\s+/g, " ")
					.replace(/^[\-\—\•\*]+/, "")
					.trim()
			);
	}
	while (bullets.length < maxBullets && cleaned) {
		// fallback: split summary into chunks
		bullets.push(summary.slice(bullets.length * 80, (bullets.length + 1) * 80));
	}

	// simple tag extraction by keyword presence
	const tags = [];
	const keywordTags = [
		["meeting", "Work"],
		["invoice", "Finance"],
		["todo", "Todo"],
		["buy", "Shopping"],
		["project", "Work"],
		["deadline", "Priority"],
		["personal", "Personal"],
		["recipe", "Personal"],
	];
	const lower = cleaned.toLowerCase();
	for (const [kw, tag] of keywordTags) {
		if (tags.length >= 3) break;
		if (lower.includes(kw)) tags.push(tag);
	}
	if (tags.length === 0) tags.push("Random");

	return {
		headline,
		summary,
		bullets,
		tags,
	};
}

/**
 * If OPENAI_API_KEY is present, uses OpenAI chat completions to produce
 * JSON output. Otherwise falls back to localSuggest.
 *
 * Response shape:
 * {
 *   headline: string,
 *   summary: string,
 *   bullets: [string],
 *   tags: [string]
 * }
 */
router.post("/", async (req, res) => {
	try {
		const { text = "", maxBullets = 3 } = req.body || {};

		if (!text || !text.trim()) {
			return res.status(400).json({ error: "Missing text to analyze" });
		}

		// If no OPENAI key, use local heuristic fallback
		if (!OPENAI_KEY) {
			const local = localSuggest(text, Math.max(1, Math.min(6, +maxBullets || 3)));
			return res.json(local);
		}

		// Use OpenAI if key available.
		// NOTE: we use the 'openai' npm package. Ensure it's installed and OPENAI_API_KEY is set.
		const { OpenAI } = require("openai");
		const client = new OpenAI({ apiKey: OPENAI_KEY });

		// Build a clear system + user prompt to ask for JSON only.
		const systemPrompt = `You are an assistant that extracts a short headline, a concise summary, 2-6 bullet points, and 1-3 suggested tags from a block of extracted text from an image. Output MUST be valid JSON only, with keys: headline, summary, bullets (array), tags (array). Do not add any extra commentary. Keep headline short (max 90 chars). Keep bullets concise.`;

		const userPrompt = `Text to analyze:
"""
${text}
"""

Return JSON with:
- headline (string)
- summary (string, 1-3 sentences)
- bullets (array of up to ${+maxBullets || 3} short bullet points)
- tags (array of 1-3 short tag names)`;

		// Call OpenAI chat completion
		const resp = await client.chat.completions.create({
			model: "gpt-4o-mini", // replace if you prefer a different model
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 400,
			temperature: 0.0,
		});

		// Attempt to parse JSON from model output
		const raw = resp.choices?.[0]?.message?.content ?? "";
		let parsed;
		try {
			// Some models sometimes include markdown or triple backticks; extract JSON substring
			const jsonMatch = raw.match(/\{[\s\S]*\}$/);
			const toParse = jsonMatch ? jsonMatch[0] : raw;
			parsed = JSON.parse(toParse);
		} catch (err) {
			// If parsing fails, return the raw text in the summary field as fallback
			console.warn("AI-suggest: failed to parse JSON, returning fallback. Raw:", raw);
			return res.json({
				headline: text.split(/\n/)[0].slice(0, 80),
				summary: raw.slice(0, 400),
				bullets: [],
				tags: [],
				raw,
			});
		}

		// Ensure arrays exist and trim lengths
		parsed.bullets = Array.isArray(parsed.bullets) ? parsed.bullets.slice(0, Math.max(1, +maxBullets)) : [];
		parsed.tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [];

		return res.json(parsed);
	} catch (err) {
		console.error("ai-suggest error:", err);
		return res.status(500).json({ error: "AI suggestion failed", message: err.message || String(err) });
	}
});

module.exports = router;
