import { GenericMessageEvent, SayArguments } from '@slack/bolt'
import app, { prisma, ENV } from './server'
import { maPool, masStats, maStats, getMa } from './convos'
import { channelMaBlocks, userMaBlocks } from './home'
import { sortedMas, nonzeroMas } from './util'


const CHANNELS_CMD = (ENV.NODE_ENV === 'development')
  ? '/channels-dev'
  : '/channels'

app.command(CHANNELS_CMD, async ({ command, ack, client, body, logger }) => {
  await ack()

  // idk why .filter doesn't work lol
  const channelsOnly = []
  for (const [chId, chMa] of sortedMas(maPool)) {
    if (chId.startsWith('C')) { channelsOnly.push([chId, chMa]) }
  }

  const channelSections = channelsOnly
    .slice(0, 5)
    .map(async ([chId, chMa], i) => {
      const { channel } = await client.conversations.info({channel: chId as string})
      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<#${chId}>*\n*Activity score:* ${chMa.ma.average()}\n*Description: * ${channel.topic.value}\n`
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "XY unread!",
            emoji: true
          },
          //action_id: `channel_select_${chId}`,
          action_id: `close`,
          value: `channel_select_${chId}`,
        },
      }
    })

  try { // Call views.open with the built-in client
    const result = await client.views.open({
      trigger_id: body.trigger_id, // Pass a valid trigger_id within 3 seconds of receiving it
      view: { // View payload
        type: 'modal',
        callback_id: 'channels_1', // View identifier
        title: {
          type: 'plain_text',
          text: 'Channel picker'
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Hi! These are the top channels to check out right now:"
            }
          },
          {
            type: "divider"
          },
          ...await Promise.all(channelSections),
        ]
      }
    })

  } catch (error) {
    console.error(error);
  }

})


//export async function modalBlocks(modalMas) { }
