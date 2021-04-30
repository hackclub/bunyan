async function channelRun() {
  if (!results) {
    var results = {}
  }

  if (!results.channels) {
    results.channels = {}
  }
  let channelData = await fetch(endpoint('top/channels')).then(r => r.json())
  channelData.forEach(cd => {
    results.channels[cd.channel_id] = {
      count: cd.count,
      name: getChannelName(cd.channel_id)
    }
  })

  Object.keys(results.channels).slice(0,5).forEach(async (channelID, index) => {
    let c = results.channels[channelID]
    let el = document.querySelector(`.channel-top-${index + 1}`)
    el.innerHTML = `${await c.name} had ${c.count} messages in the last hour`
    el.classList.remove('loading')
  })
}

channelRun()
setInterval(channelRun, 15 * 1000)