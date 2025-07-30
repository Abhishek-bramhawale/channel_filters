const express = require('express');
const router = express.Router();
const YouTubeService = require('../services/youtubeService');
const CacheModel = require('../models/Cache');

router.get('/test', (req, res) => {
  res.json({ message: 'YouTube API is working!' });
});

router.options('/analyze', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

router.post('/analyze', async (req, res) => {
  try {
    console.log('Received analyze request:', req.body);
    const { channelUrl, dateRange, minDuration, maxDuration, excludeShorts } = req.body;
    if (!channelUrl) {
      return res.status(400).json({ error: 'Channel URL is required' });
    }

    const cacheKey = `${channelUrl}-${JSON.stringify(dateRange)}-${minDuration}-${maxDuration}-${excludeShorts}`;
    const cachedResult = await CacheModel.findOne({ 
      key: cacheKey,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes cache
    });
    if (cachedResult) {
      return res.json({ videos: cachedResult.data });
    }
    
    const channelId = await YouTubeService.getChannelIdFromUrl(channelUrl);
    const videos = await YouTubeService.getChannelVideos(
      channelId, 
      dateRange, 
      minDuration, 
      maxDuration, 
      excludeShorts
    );

     await CacheModel.findOneAndUpdate(
      { key: cacheKey },
      { key: cacheKey, data: videos, createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({ videos });
  } catch (error) {
    console.error('Error analyzing channel:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;