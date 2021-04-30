function endpoint(path) {
  return window.location.origin + '/api/' + path
}

var slackLookupCache = {}

async function getChannelName(channelID) {
  if (!slackLookupCache.channels) {
    slackLookupCache.channels = {}
  }

  if (!slackLookupCache.channels[channelID]) {
    slackLookupCache.channels[channelID] = fetch(endpoint(`demo-channel-lookup/${channelID}`)).then(r => r.json()).then(r => `#${r.name}`).catch(err => 0)
  }

  return await slackLookupCache.channels[channelID]
}

async function getSlackEmoji(emoji) {
  if (!slackLookupCache.emoji) {
    slackLookupCache.emoji = {}
  }

  if (slackLookupCache.emoji[emoji]) {
    slackLookupCache.channels[channelID] = fetch(endpoint(`demo-emoji-lookup/${emoji}`)).then(r => r.json()).then(j => j.src).catch(err => 0)
  }

  return await slackLookupCache.emoji[emoji]
}
