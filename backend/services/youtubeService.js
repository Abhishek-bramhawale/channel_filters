const { google } = require('googleapis')

class YouTubeService {
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    })
  }

    async getVideoIds(channelId, publishedAfter) { //vid ids from channelid
    let videoIds = []
    let nextPageToken = null
    do {
      const response = await this.youtube.search.list({
        part: 'id',
        channelId: channelId,
        publishedAfter: publishedAfter.toISOString(),
        order: 'date',
        type: 'video',
        maxResults: 50,
        pageToken: nextPageToken
      })
      const ids = response.data.items.map(item => item.id.videoId)
      videoIds = videoIds.concat(ids)
      nextPageToken = response.data.nextPageToken
    } while (nextPageToken && videoIds.length < 200)
    return videoIds
  }

  async getVideoDetails(videoIds) { //metadata
    const videos = []
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50)
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: batch.join(',')
      })
      const batchVideos = response.data.items.map(video =>({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
          views: parseInt(video.statistics.viewCount || 0),
          likes: parseInt(video.statistics.likeCount || 0),
          comments: parseInt(video.statistics.commentCount || 0),
        duration: video.contentDetails.duration,
        uploadDate: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        channelTitle: video.snippet.channelTitle
      }))
      videos.push(...batchVideos)
    }
    return videos
  }
  
  async getChannelIdFromUrl(url) { //url to id(channel)
    let channelId = null
    if (url.includes('/channel/')) {
      channelId = url.split('/channel/')[1].split(/[/?#]/)[0]
    } else if (url.includes('/@')) {
      const username = url.split('/@')[1].split(/[/?#]/)[0]
      channelId = await this.searchChannelByUsername(username)
    } else if (url.includes('/c/') || url.includes('/user/')) {
      const channelName = url.split(/\/[cu]\//)[1].split(/[/?#]/)[0]
      channelId = await this.searchChannelByUsername(channelName)
    }
    if (!channelId) throw new Error('Invalid YouTube channel URL')
    return channelId
  }

  async searchChannelByUsername(query) { //(helper func) actual api hitting to GET https://www.googleapis.com/youtube/v3/search

    const response = await this.youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults: 1
    })
    if (response.data.items.length === 0) throw new Error('Channel not found')
    return response.data.items[0].snippet.channelId
  }

   async getChannelVideos(channelId, days = 7, minDuration = null, maxDuration = null, excludeShorts = true) {
    const publishedAfter = new Date()
    publishedAfter.setDate(publishedAfter.getDate() - days)
    const videoIds = await this.getVideoIds(channelId, publishedAfter)
    if (videoIds.length === 0) return []
    const videos = await this.getVideoDetails(videoIds)
    let filteredVideos = videos.filter(video => {
      const durationInSeconds = this.parseDuration(video.duration)
      const durationInMinutes = durationInSeconds / 60
      if (excludeShorts && durationInSeconds < 60) return false
      if (minDuration && durationInMinutes < minDuration) return false
      if (maxDuration && durationInMinutes > maxDuration) return false
      return true
    })
    filteredVideos.sort((a, b) => b.views - a.views)
    return filteredVideos
  }

  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return 0
    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0
    return hours * 3600 + minutes * 60 + seconds
  }
}

module.exports = new YouTubeService()