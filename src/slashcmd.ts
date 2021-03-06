import { GenericMessageEvent, SayArguments } from '@slack/bolt'
import app, { prisma, ENV } from './server'
import { formatRelative, subMinutes } from 'date-fns'
import { BOT_ID } from './commands'
import {
  TopEmoji, TopChannels, TopUsers,
  TopUsersForChannel, TopEmojiForChannel,
  TopEmojiForUser, TopChannelsForUser,
  TopChannelsForEmoji, TopUsersForEmoji,
} from './scripts/queries'


const CMD = {
  sup:     (ENV.NODE_ENV === 'development') ? '/dev-asdf'    : '/sup',
  supwit:  (ENV.NODE_ENV === 'development') ? '/dev-asdflol' : '/supwit',
}

app.command(CMD.sup, async ({ command, ack, client, body, respond, logger }) => {
  logger.info(command)
  await ack()

  await respond({
    response_type: 'ephemeral',
    replace_original: true,
    blocks: [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `\`${command.command} ${command.text}\` :robot_face:`,
          `:axe: Ayy, hold up.. Grabbing some logs rq... :wood:`,
        ].join('\n')
      }
    },]
  })

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
  if (argTime <= 0) { argTime = 420 } // default
  const sampleTime = new Date(Date.now() - 1000 * 60 * argTime)

  const chSamples = await prisma.movingAverage.groupBy({
    by: ['slack_id'],
    _sum: { average: true, messages: true },
    _avg: { average: true, },
    _max: { average: true, },
    _count: { _all: true, },
    where: { // channels within the past `time`
      created: { gt: sampleTime, },
      slack_id: { startsWith: 'C', },
      slack_resource: { watching: true, },
    },
    //orderBy: { _max: {average: 'desc', }, },
    orderBy: { _avg: {average: 'desc', }, },
    having: { average: { _avg: {gt: 0}, }, },
    // TODO: make .take a /channels arg
    take: 5,
  })

  if (chSamples.length === 0) {
    // We failed here if this happens. Give a nice error message!
    await respond({
      response_type: 'ephemeral',
      replace_original: true,
      blocks: [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `:sweat_smile: OKAY nvm the surf was _NOT_ up lol! I had some trouble with the logs.. :sweat:`,
            `:ox: Seems like ol' Babe isn't pulling her weight, eh! :man-shrugging:`,
            `:happy_ping_sock: (ping @zfogg maybe?..) :expanding_brain_4:`,
          ].join('\n')
        }
      },]
    })
    return
  }


  const channelSections = chSamples
    .map(async (chSamp: any, i) => {
      const { channel } = await client.conversations.info({channel: chSamp.slack_id})
      //const score = (Math.exp(chMa.ma.average()) - 1).toFixed(4)
      const score_sum = ((        chSamp._sum.average)).toFixed(2)
      const score_avg = (Math.exp(chSamp._avg.average)).toFixed(2)
      const score_max = ((        chSamp._max.average)).toFixed(2)
      const desc = (channel as any).topic.value
      const desc_lines = desc.split('\n').length // max line limit smh @anirudhb
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `*#${i+1}:* <#${chSamp.slack_id || 'NULL'}> (past *${argTime}* mins: *${chSamp._sum.messages || 0}* messages)`,
              `*Activity score:* average = *${score_avg || -1}* | maximum = *${score_max || -1}*`,
              `${desc.substring(0, 512) || ''}${(desc.length > 512 || desc_lines > 3) ? ' [...]' : ''}`  // 512 char limit
                .split('\n').slice(0, 3).join('\n'),
            ].join('\n'),
          },
        },
        { type: "divider" },
      ]
    })

  try {
    const sections = [].concat.apply([], await Promise.all(channelSections as any));

    await respond({
      response_type: 'ephemeral',
      replace_original: true,
      blocks: [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `:axe: Surfs' up! Specifically in these channels :sparkles:`,
            `_(since ${formatRelative(subMinutes(new Date(), argTime), new Date())})_`,
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


app.command(CMD.supwit, async ({ command, ack, client, body, respond, logger }) => {
  logger.info(command)
  await ack()

  //console.log(command)

  //const argTime_matches = (new RegExp(`^(\\d+)$`)).exec(command.text)
  const arg1Matches = /^(\d+)/.exec(command.text)
  //console.log({arg1Matches})
  let argTime: number = 0
  if (arg1Matches && arg1Matches[1]) {
    argTime = parseInt(arg1Matches[1], 10)
  }
  if (argTime <= 0) { argTime = 1440 } // default
  const gt =  new Date(Date.now() - 1000 * 60 * argTime) // gt = further into the past <---<---
  const lt = new Date(Date.now())                        // lt = closer to the present --->--->

  let arg2_text = arg1Matches ? command.text.split(' ').slice(1).join('') : command.text
  let argUserMatch    = /^<(\@)(\w+)(\|.+)?>/.exec(arg2_text)
  let argChannelMatch = /^<(\#)(\w+)(\|.+)?>/.exec(arg2_text)
  let argEmojiMatch   = /^(:)(.+):/.exec(arg2_text)
  let arg2Match: any = null
  const arg2Matches = [argUserMatch, argChannelMatch, argEmojiMatch]
    .filter((x) => x !== null)
    .sort((x, y) => (x && y) ? x.index - y.index : Infinity)
  if (arg2Matches.length) { arg2Match = arg2Matches[0] }

  let argSlackId: string | null = null
  let argSlackType: string | null = null
  let argSlackTypeName: string | null = null
  let argSlackTypeRender: string | null = null
  if (arg2Match && arg2Match[1] && arg2Match[2]) {
    argSlackId   = arg2Match[2]
    argSlackType = arg2Match[1]
    if      (argSlackType === '#') { argSlackTypeName = 'channel'; argSlackTypeRender = `<#${argSlackId}>` }
    else if (argSlackType === '@') { argSlackTypeName = 'user';    argSlackTypeRender = `<@${argSlackId}>` }
    else                           { argSlackTypeName = 'emoji';   argSlackTypeRender = `:${argSlackId}:` }
  }

  let responseBlocks: any[] = []

  if (argSlackId && argSlackTypeName === 'channel') {
    let topUsersForChannel = await TopUsersForChannel([argSlackId], [gt, lt])
    if (topUsersForChannel.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _@users_ for ${argSlackTypeRender}:`,
            topUsersForChannel.map(x => `<@${x.user_id}> (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

    let topEmojiForChannel = await TopEmojiForChannel([argSlackId], [gt, lt])
    if (topEmojiForChannel.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _:emoji:_ for ${argSlackTypeRender}:`,
            topEmojiForChannel.map(x => `:${x.emoji_id}: (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

  } else if (argSlackId && argSlackTypeName === 'user')    {
    let topEmojiForUser    = await TopEmojiForUser([argSlackId], [gt, lt])
    if (topEmojiForUser.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _:emoji:_ for ${argSlackTypeRender}:`,
            topEmojiForUser.map(x => `:${x.emoji_id}: (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

    let topChannelsForUser = await TopChannelsForUser([argSlackId], [gt, lt])
    if (topChannelsForUser.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _#channels_ for ${argSlackTypeRender}:`,
            topChannelsForUser.map(x => `<#${x.channel_id}> (${x._count})`).join(', ')
          ].join('\n'),
        },
      })
    }

  } else if (argSlackId && argSlackTypeName === 'emoji')   {
    let topChannelsForEmoji = await TopChannelsForEmoji([argSlackId], [gt, lt])
    if (topChannelsForEmoji.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _#channels_ for ${argSlackTypeRender}:`,
            topChannelsForEmoji.map(x => `<#${x.channel_id}> (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

    let topUsersForEmoji    = await TopUsersForEmoji([argSlackId], [gt, lt])
    if (topUsersForEmoji.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top _@users_ for ${argSlackTypeRender}:`,
            topUsersForEmoji.map(x => `<@${x.user_id}> (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

  } else {
    let topEmoji = await TopEmoji(25, [gt, lt])
    if (topEmoji.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top *:emoji:* _(hint: try \`${CMD.supwit} :scrappy:\`)_`,
            //topEmoji.map(x => `:${x.emoji_id}: - \`:${x.emoji_id}:\` (${x._count._all})`).join(', ')
            topEmoji.map(x => `:${x.emoji_id}: (${x._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

    let topChannels = await TopChannels(25, [gt, lt])
    if (topChannels.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top *#channels* _(hint: try \`${CMD.supwit} #scrapbook\`)_`,
            topChannels.map(x => `<#${x.channel_id}> (${(x as any)._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

    let topUsers = await TopUsers(25, [gt, lt])
    if (topEmoji.length) {
      responseBlocks.push({ type: "divider" })
      responseBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `Top *@users* _(hint: try \`${CMD.supwit} @scrappy\`)_`,
            topUsers.map(x => `<@${x.user_id}> (${(x as any)._count._all})`).join(', ')
          ].join('\n'),
        },
      })
    }

  }

  //console.log(responseBlocks)

  const queryMsg = argSlackType ? `\`${argSlackTypeName}\` - ${argSlackTypeRender}` : 'ALL OF SLACK'
  const headerMsg = responseBlocks.length > 0
    ? [
      `\`${command.command} ${command.text}\` :robot_face:`,
      `:wave: Phew! Logs are heavy. Here's ur info.. :sparkles:`,
      ].join('\n')
    : `:sad-yeehaw: Well shucks, I don't have anything in my log pile that matches that. I reckon if you run this in the future though I can find something for you.`

  //console.log({argSlackType, argSlackTypeName, argSlackTypeRender, argSlackId})

  const bodyMsg = responseBlocks.length > 0
    ? `'sup wit: ${queryMsg} _(since ${formatRelative(subMinutes(new Date(), argTime), new Date())})_`
    : `_(hint: try \`<@${BOT_ID}> status (channel|me)\` or \`<@${BOT_ID}> help\`)_`

  await respond({
    response_type: 'ephemeral',
    replace_original: true,
    blocks: [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          headerMsg,
          bodyMsg,
        ].join('\n')
      }
    },
      ...responseBlocks,
    ]
  })

})


//export async function modalBlocks(modalMas) { }
