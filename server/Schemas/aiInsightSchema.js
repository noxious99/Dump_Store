const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Per-user cache of AI-generated dashboard insights.
//
// Generating insights costs an LLM call (latency + money), so we don't do it
// on every dashboard load. One document per user, upserted. We regenerate when:
//   - the underlying data changed (inputHash differs), or
//   - the cache aged past its TTL (time-relative text like "5 days left"
//     should not go stale), or
//   - the client explicitly forces a refresh.
const insightItemSchema = new Schema({
    id: String,
    text: String,                                  // may contain the ¤ currency token
    emoji: String,
    tone: { type: String, enum: ['good', 'warn', 'neutral'], default: 'neutral' },
    domain: { type: String, enum: ['expense', 'goals', 'iou', 'general'], default: 'general' },
}, { _id: false });

const aiInsightSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    insights: {
        type: [insightItemSchema],
        default: [],
    },
    // 'ai' when produced by Gemini, 'fallback' when the rule-based/templated
    // path produced them (Gemini unavailable or insufficient data).
    source: {
        type: String,
        enum: ['ai', 'fallback'],
        default: 'fallback',
    },
    // Signature of the snapshot the insights were built from. Lets us detect
    // material data changes and bust the cache without a full TTL wait.
    inputHash: {
        type: String,
        default: '',
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    // Manual "refresh" forces a fresh LLM call, so it's rate-limited per UTC day
    // to stop a user spamming the model. refreshDay is the 'YYYY-MM-DD' the
    // count belongs to; it resets when a new day's first refresh lands.
    refreshDay: {
        type: String,
        default: '',
    },
    refreshCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model("AiInsight", aiInsightSchema);
