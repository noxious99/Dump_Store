const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const iouController = require("../controller/iouController");

// Summary (dashboard)
router.get('/summary', auth, iouController.getSummaryHandler);

// CRUD
router.post('/', auth, iouController.createIouHandler);
router.get('/', auth, iouController.getIousHandler);
router.get('/:id', auth, iouController.getIouByIdHandler);
router.patch('/:id', auth, iouController.updateIouHandler);
router.delete('/:id', auth, iouController.deleteIouHandler);

// State transitions
router.post('/:id/settle', auth, iouController.settleIouHandler);
router.post('/:id/cancel', auth, iouController.cancelIouHandler);

module.exports = router;
