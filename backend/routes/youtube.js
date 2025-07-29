const express = require('express');
const router = express.Router();
const YouTubeService = require('../services/youtubeService');

router.post('/analyze', async (req, res) => {
  try {
    const { channelUrl, days, minDuration, maxDuration, excludeShorts } = req.body;
    if (!channelUrl) {
      return res.status(400).json({ error: 'Channel URL is required' });
    }
    
    const channelId = await YouTubeService.getChannelIdFromUrl(channelUrl);
    const videos = await YouTubeService.getChannelVideos(
      channelId, 
      days, 
      minDuration, 
      maxDuration, 
      excludeShorts
    );
    
    res.json({ videos });
  } catch (error) {
    console.error('Error analyzing channel:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;