import { GenericMessageEvent, SayArguments } from '@slack/bolt'
import app, { prisma, ENV } from './server'
import { maPool, masStats, maStats, getMa } from './convos'
import { channelMaBlocks, userMaBlocks } from './home'
import { sortedMas, nonzeroMas } from './util'


const CHANNELS_CMD = (ENV.NODE_ENV === 'development')
  ? '/channels-dev'
  : '/channels'

app.command(CHANNELS_CMD, async ({ command, ack, client, body, respond, logger }) => {
  await ack()

  // idk why .filter doesn't work lol
  //const channelsOnly = []
  //for (const [chId, chMa] of sortedMas(maPool)) {
    //if (chId.startsWith('C') && chMa.ma.average() > 0) {
      //channelsOnly.push([chId, chMa])
    //}
  //}

  const commandMatches = (new RegExp(`^(\\d+)$`)).exec(command.text)
  let argTime: number = 0
  if (commandMatches && commandMatches[1]) {
    argTime = parseInt(commandMatches[1], 10)
  }
  if (argTime <= 0) { argTime = 120 }

  const sampleTime = new Date(Date.now() - 1000 * 60 * argTime)

  const chSamples = await prisma.movingAverage.groupBy({
    by: ['slack_id'],
    sum: { average: true, },
    avg: { average: true, },
    count: { _all: true, },
    where: { // channels within the past `time`
      created: { gt: sampleTime, },
      slack_id: { startsWith: 'C', },
      slack_resource: { watching: true, },
    },
    orderBy: {_sum: {average: 'desc', }, },
    having: { average: { avg: {gt: 0}, }, },
    // TODO: make .take a /channels arg
    take: 5,
  })

  const channelSections = chSamples
    .map(async (chSamp: any, i) => {
      const { channel } = await client.conversations.info({channel: chSamp.slack_id})
      //const score = (Math.exp(chMa.ma.average()) - 1).toFixed(4)
      const score = (Math.exp(chSamp.avg.average)).toFixed(4)
      const desc = (channel as any).topic.value
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `*#${i+1}.* _activity score:_ ${score || -1} | <#${chSamp.slack_id || 'NULL'}>`,
              `${desc || ''}`,
            ].join('\n'),
          },
        },
        {
          type: "divider"
        },
      ]
    })

  try { // Call views.open with the built-in client
    //const result = await client.views.open({
    //const result = await client.views.open({
      //trigger_id: body.trigger_id, // Pass a valid trigger_id within 3 seconds of receiving it
      //view: { // View payload
        //type: 'modal',
        //callback_id: 'channels_1', // View identifier
        //title: {
          //type: 'plain_text',
          //text: 'Channel picker'
        //},
        //blocks: [
          //{
            //type: "section",
            //text: {
              //type: "mrkdwn",
              //text: "Hi! These are the top channels to check out right now:"
            //}
          //},
          //{
            //type: "divider"
          //},
          //...await Promise.all(channelSections),
        //]
      //}
    //})

    const sections = [].concat.apply([], await Promise.all(channelSections));

    await respond({
      response_type: 'ephemeral',
      replace_original: true,
      blocks: [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `:wave: Hi! These are the top channels to check out right now :sparkles:`,
            `_(since ${sampleTime})_`,
          ].join('\n')
        }
      },
        {
          type: "divider"
        },
        ...sections,
      ]
    })


  } catch (error) {
    console.error(error);
  }

})


//export async function modalBlocks(modalMas) { }
