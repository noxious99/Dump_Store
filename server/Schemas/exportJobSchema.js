const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// A user-requested data export (CSV or PDF). Generation is async: the request
// handler creates the job as `queued`, a background worker claims it, generates
// the file, stores the bytes on the doc, and marks it `ready`. The client polls
// status and then downloads. Jobs (and their bytes) auto-expire via a TTL index
// so financial files never linger on the server.
const exportJobSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'queued',
      index: true,
    },
    format: { type: String, enum: ['csv', 'pdf'], required: true },
    range: {
      from: Date,
      to: Date,
      label: String, // e.g. "This month" — purely for display
    },
    // Display context supplied by the client (the user's own currency).
    currency: { type: String, default: '' },
    symbol: { type: String, default: '' },

    filename: String,
    mimeType: String,
    file: Buffer, // populated only once status === 'ready'
    size: Number,
    error: String,
    completedAt: Date,

    // Auto-delete the job + its bytes 24h after creation (TTL index below).
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

exportJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ExportJob', exportJobSchema);
