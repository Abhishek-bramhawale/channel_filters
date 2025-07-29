const express = require('express');
const router = express.Router();
const CacheModel = require('../models/Cache');

router.delete('/clear', async (req, res) => {
  try {
    await CacheModel.deleteMany({});
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalEntries = await CacheModel.countDocuments();
    const oldestEntry = await CacheModel.findOne().sort({ createdAt: 1 });
    const newestEntry = await CacheModel.findOne().sort({ createdAt: -1 });
    res.json({
      totalEntries,
      oldestEntry: oldestEntry?.createdAt,
      newestEntry: newestEntry?.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;