const ExportJob = require('../Schemas/exportJobSchema');
const exportService = require('../services/exportService');

// Mongo-backed job worker (no Redis). Polls for `queued` export jobs, claims one
// atomically (so it's safe even if this ever runs as multiple instances/processes),
// generates the file via the export service, stores the bytes, and marks it ready.
const POLL_MS = Number(process.env.EXPORT_WORKER_POLL_MS) || 2000;
const MAX_PER_TICK = 5; // drain a small batch each tick so a backlog clears fast

let timer = null;

const processOne = async () => {
  // Atomic claim: flip the oldest queued job to processing in one op.
  const job = await ExportJob.findOneAndUpdate(
    { status: 'queued' },
    { $set: { status: 'processing' } },
    { new: true, sort: { createdAt: 1 } }
  );
  if (!job) return false;

  try {
    const { buffer, filename, mimeType } = await exportService.generate(job);
    job.file = buffer;
    job.size = buffer.length;
    job.filename = filename;
    job.mimeType = mimeType;
    job.status = 'ready';
    job.completedAt = new Date();
    await job.save();
  } catch (err) {
    console.error(`[exportWorker] job ${job._id} failed:`, err.message);
    job.status = 'failed';
    job.error = err.message || 'Generation failed';
    job.file = undefined;
    await job.save();
  }
  return true;
};

const tick = async () => {
  try {
    let n = 0;
    // keep claiming until the queue is empty or we hit the per-tick cap
    while (n < MAX_PER_TICK && (await processOne())) n++;
  } catch (err) {
    console.error('[exportWorker] tick error:', err.message);
  } finally {
    timer = setTimeout(tick, POLL_MS);
  }
};

const startExportWorker = () => {
  if (timer) return; // already running
  console.log('[exportWorker] started');
  tick();
};

module.exports = { startExportWorker };
