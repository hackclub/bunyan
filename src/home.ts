import app from './server'
import { maPool, pushMas, pullMas, maStats, MaStat } from './convos'


app.event('app_home_opened', async ({ event, client, context }) => {
  const sortedMaEntries = Object.entries(maPool).sort((a, b) => {
    if (a[1].ma.average() < b[1].ma.average()) {
      return 1
    } else if (a[1].ma.average() > b[1].ma.average()) {
      return -1
    } else {
      return 0
    }
  })
  const emaBlocks = []
  for (const [chId, chMa] of sortedMaEntries) {
    const maStat = maStats(chId, chMa.ma)
    emaBlocks.push(...channelMaBlocks(chId, maStat, chMa.watching))
    emaBlocks.push({"type": "divider"})
  }
  emaBlocks.pop() // FIXME: this is to get rid of the final divider lmao

  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,
      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Exponential moving averages (EMAs) by channel*\n\n_'Enabled' and 'Disable' do NOT work yet!_\n\n_'Watching' also does not work yet!_\n\nSend a PR or plz wait :)"
            }
          },
          {
            "type": "divider"
          },
        ]
        .concat(emaBlocks) // FIXME: this is ugly lol
      }
    })
  }

  catch (error) {
    console.error(error)
  }
})


function channelMaBlocks(slackId: string, maStat: MaStat, watching: boolean) {
  return [
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `Channel tracked: ${watching ? '✔️' : '🚫'}`
        },
      ]
    },

    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*<#${slackId}>*\nAverage: *${maStat.average}*\nVariance: *${maStat.variance}*\nDeviation: *${maStat.deviation}*\nForecast: *${maStat.forecast}*`
      },
    },

    { // TODO: implement these with the `.watching` property
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Enable",
            "emoji": true
          },
          "style": "primary",
          "value": "approve"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Disable",
            "emoji": true
          },
          "style": "danger",
          "value": "decline"
        },
      ]
    },
  ]
}

