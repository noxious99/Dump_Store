const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const exportController = require('../controller/exportController');

router.post('/', auth, exportController.createExport);
router.get('/:id', auth, exportController.getExportStatus);
router.get('/:id/download', auth, exportController.downloadExport);

module.exports = router;
