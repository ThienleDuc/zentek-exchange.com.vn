const express = require('express');
const router = express.Router();
const storeController = require('../../controllers/store.controller');

// API Endpoints: /api/stores
router.get('/', storeController.getStores);
router.get('/filters', storeController.getFilters);

module.exports = router;
