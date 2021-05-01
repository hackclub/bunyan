import { GenericMessageEvent, SayArguments } from '@slack/bolt'
import app, { prisma } from './server'
import { maPool, masStats, maStats, getMa } from './convos'
import { channelMaBlocks, userMaBlocks } from './home'


const BOT_NAME = `paulb`

const BOT_ID = process.env.BOT_ID || `U01S7UUCB89`

const BOT_CHID = process.env.BOT_CHID || `CGSEAP135`

const USER_IDS = {
  zrl:   'U0266FRGP',
  zfogg: 'U01DV5F30CF',
}

//* if you run \`/sup\`, i'll tell you what _'sup_ in slack. you can run \`/sup 600\` to see what 'sup over the past 10 hours.
//* if you run \`/supwit [:emoji:, #channel, @user]\` i'll tell you what _'sup wit_ that thing. i'll tell you what 'sup wit other stuff in slack if you don't give me anything specific (\`/supwit\`). i'll tell you what 'sup wit stuff over the past 1440 minutes by default, but you can pass in a different number of minutes like \`/supwit 120\` or \`/supwit 120 #lounge\` \`/supwit 120 <@${USER_IDS.zfogg}>\` or \`/supwit 120 :upvote:\` for two hours.
const MSGS = {
  joinChannel: `:wave: hi! :wave: i'm a bot by \`<@${USER_IDS.zfogg}>\` that streams and logs slack activity so people can easily discover new channels. :canadaparrot:

don't want your channel (or your account) to be part of this? that's ok! just type \`<@${BOT_ID}> disable me\` to have me ignore all of your messages or \`<@${BOT_ID}> disable channel\` to have me ignore this whole channel.

if you want to re-enable streaming, you can type \`<@${BOT_ID}> enable me\` or \`<@${BOT_ID}> enable channel\` and if you want to check whether i'm streaming, you can type \`<@${BOT_ID}> status me\` or \`<@${BOT_ID}> status channel\`.

send the message \`<@${BOT_ID}> stats me\` or \`<@${BOT_ID}> stats channel\` to see information about yourself or the channel you're in. you can find channel info on this bot's home tab! (click my username 😎).

i'll never stream private messages, group chats, or private channels. message \`<@${USER_IDS.zfogg}>\` if you have any questions. happy hacking!

you can find me at \`https://github.com/hackclub/bunyan\`!`,

  help: `:axe: <@${BOT_ID}> is a Californian surfer and lumberjack whose best friend is a blue ox :ox:.
this guy is super into logging, so he always knows what ’sup around slack.

1. \`/sup\` - bunyan will tell you what ’sup in slack (over the past 120mins).
* \`/sup 1440\` What ’sup over the past day (1 day = 1440 minutes)
* \`/sup 600\` What ’sup over the past 10 hours (10 hours = 600 minutes).


2. \`/supwit\`  - run with an emoji, channel, or user, and bunyan will tell you what ’sup wit that thing! (\`/supwit :upvote:\` , \`/supwit #lounge\`, \`/supwit @scrappy\`)
* \`/supwit\` What 'sup wit Hack Club tho?
* \`/supwit 60\` What 'sup wit Hack Club in the past 60 minutes?
* \`/supwit @orpheus\` Where has @orpheus been active recently?
* \`/supwit 45 :yay:\` Where has the :yay: reaction been used in the last 45 min?
* \`/supwit 120 #lounge\` What’s been happening in #lounge over the past 2 hours?


<@${BOT_ID}> only logs interaction times, not their contents, not private channels or DMs, and you may opt out any time.
* type \`<@${BOT_ID}> disable me\` to ignore all messages or \`<@${BOT_ID}> disable channel\` if don't want your channel (or account) to be part of this.
* type \`<@${BOT_ID}> enable me\` or \`<@${BOT_ID}> enable channel\` to re-enable this.
* type \`<@${BOT_ID}> status me\` or \`<@${BOT_ID}> status channel\` to see what 'sup.

made by <@${USER_IDS.zfogg}> with <3 at Hack Club HQ`,

  disableMe: `i will now ignore your messages`,
  enableMe:  `i will now stream your messages`,

  disableChannel: `i will now ignore this channel's messages`,
  enableChannel:  `i will now stream this channel's messages`,

  statusMeIgnoring:  `i am ignoring your messages`,
  statusMeListening: `i am streaming your messages`,

  statusChannelIgnoring:  `i am ignoring this channel's messages`,
  statusChannelListening: `i am streaming this channel's messages`,
}


async function setWatching(id: string, onOff: boolean) {
  const ma = maPool[id]
  if (!(id in maPool) || typeof ma === 'undefined') {
    throw new Error(`resource with id '${id}' is unknown`)
  }
  try { // FIXME: this should happen in bulk
    await prisma.slackResource.upsert({
      where:  { id, },
      create: { id, watching: onOff },
      update: {     watching: onOff },
    })
  } catch (e) {
    console.error(e)
  }
  return ma.watching = onOff
}

async function statusWatching(id: string) {
  return maPool[id]?.watching
}


//app.message(RegExp(`^<@${BOT_ID}> help`, `i`), async ({ message, client, logger, context }) => {
app.event('app_mention', async ({ event, say, client, logger }) => {
  if (!event.text.startsWith(`<@${BOT_ID}>`)) {
    return
  }

  if ('user' in event && event.user !== undefined) {
    // Not all messages have a user FIXME

    let context
    let msg = ''

    const message = event
    const _message = (message as unknown) as GenericMessageEvent
    const thread_ts = _message.thread_ts || _message.ts

    if (context = event.text.match(RegExp(`^<@${BOT_ID}> help`, `i`))) {
      msg = MSGS.help

    } else if (context = event.text.match(RegExp(`^<@${BOT_ID}> (enable|disable) (me|channel)`, `i`))) {
      try {
        const meOrChan = context[2]
        const onOrOff  = context[1]
        switch (`${meOrChan}.${onOrOff}`) {
          case `me.disable`:
            await setWatching(event.user, false)
            msg = MSGS.disableMe
            break
          case `me.enable`:
            await setWatching(event.user, true)
            msg = MSGS.enableMe
            break
          case `channel.disable`:
            await setWatching(event.channel, false)
            msg = MSGS.disableChannel
            break
          case `channel.enable`:
            await setWatching(event.channel, true)
            msg = MSGS.enableChannel
            break
          default:
            throw new Error('unknown context matches')
        }
      } catch (e) {
        console.error(msg = 'could not enable/disable. check your command?', event, e)
      }

    } else if (context = event.text.match(RegExp(`^<@${BOT_ID}> status (me|channel)`, `i`))) {
      switch (context[1]) {
        case `me`:
          const meOnOff = await statusWatching(event.user)
          msg = meOnOff ? MSGS.statusMeListening : MSGS.statusMeIgnoring
          break
        case `channel`:
          const chOnOff = await statusWatching(event.channel)
          msg = chOnOff ? MSGS.statusChannelListening : MSGS.statusChannelIgnoring
          break
        default:
          console.error(msg = 'could not get status. check your command?', event)
      }

    } else if (context = event.text.match(RegExp(`^<@${BOT_ID}> stats (me|channel)`, `i`))) {
      let blocks
      switch (context[1]) {
        case `me`:
          const usMa = getMa(event.user)
          if (usMa === undefined || usMa.ma == undefined) { break }
          const usMaStats = maStats(event.user, usMa.ma, usMa.iMsgs)
          blocks = userMaBlocks(event.user, usMaStats, usMa.watching)
          await say({blocks, thread_ts})
          break
        case `channel`:
          const chMa = getMa(event.channel)
          if (chMa === undefined || chMa.ma == undefined) { break }
          const chMaStats = maStats(event.channel, chMa.ma, chMa.iMsgs)
          blocks = channelMaBlocks(event.channel, chMaStats, chMa.watching)
          await say({blocks: blocks as SayArguments, thread_ts})
          break
        default:
          console.error(msg = 'could not get status. check your command?', event)
          await say({text: msg, thread_ts})
      }
      return
    }

    if (msg.length === 0) {
      msg = `:axe: check your command :sad-yeehaw:\n(try \`<@${BOT_ID}> help\`)` // FIXME lol proper error handling
    }

    await client.chat.postMessage({ // .postEphemeral
      channel: event.channel,
      user: event.user,
      text: msg,
      thread_ts,
    })

  }
})
