const { google } = require('googleapis')

class YouTubeService {
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    })
  }

    async getVideoIds(channelId, publishedAfter) {
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
  
  async getChannelIdFromUrl(url) { 
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

  async searchChannelByUsername(query) { //actual api hitting to GET https://www.googleapis.com/youtube/v3/search

    const response = await this.youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults: 1
    })
    if (response.data.items.length === 0) throw new Error('Channel not found')
    return response.data.items[0].snippet.channelId
  }
}

module.exports = new YouTubeService()