import { GenericMessageEvent, SayArguments } from '@slack/bolt'
import app from './server'
import { maPool, masStats, maStats, getMa } from './convos'
import { airtable } from './api'
import { channelMaBlocks, userMaBlocks } from './home'


const BOT_NAME = `streamBOOT`

const BOT_ID = `U01S7UUCB89`

const BOT_CHID = `CGSEAP135`

const USER_IDS = {
  zrl:   'U0266FRGP',
  zfogg: 'U01DV5F30CF',
}

const MSGS = {
  joinChannel: `:wave: hi! :wave: i'm a bot built by <@${USER_IDS.zrl}> and revamped by <@${USER_IDS.zfogg}> that streams channel activity to <#${BOT_CHID}> so people can easily discover new channels. :canadaparrot:

don't want your channel (or your account) to be part of this? that's ok! just type \`<@${BOT_ID}> disable me\` to have me ignore all of your messages or \`<@${BOT_ID}> disable channel\` to have me ignore this whole channel.

if you want to re-enable streaming, you can type \`<@${BOT_ID}> enable me\` or \`<@${BOT_ID}> enable channel\` and if you want to check whether i'm streaming, you can type \`<@${BOT_ID}> status me\` or \`<@${BOT_ID}> status channel\`.

send the message \`<@${BOT_ID}> stats me\` or \`<@${BOT_ID}> stats channel\` to see information about yourself or the channel you're in. you can find channel info on this bot's home tab! (click my username 😎).

i'll never stream private messages, group chats, or private channels. message <@${USER_IDS.zrl}> or <@${USER_IDS.zfogg}> if you have any questions. happy hacking!

you can find me at \`https://github.com/hackclub/sb2\`!`,

  disableMe: `i will now ignore your messages`,
  enableMe:  `i will now stream your messages`,

  disableChannel: `i will now ignore this channel's messages`,
  enableChannel:  `i will now stream this channel's messages`,

  statusMeIgnoring:  `i am ignoring your messages`,
  statusMeListening: `i am streaming your messages`,

  statusChannelIgnoring:  `i am ignoring this channel's messages`,
  statusChannelListening: `i am streaming this channel's messages`,
}


// {{{ FIXME: let's use Redis or Airtable for all of this
async function setWatching(id: string, onOff: boolean) {
  const ma = maPool[id]
  if (!(id in maPool) || typeof ma === 'undefined') {
    throw new Error(`resource with id '${id}' is unknown`)
  }
  try {
    await airtable.upsert(`slack_id`, {slack_id: id, watching: onOff})
  } catch (e) {
    console.error(e)
  }
  return ma.watching = onOff
}

async function statusWatching(id: string) {
  return maPool[id]?.watching
}
// }}}


//app.message(RegExp(`^<@${BOT_ID}> help`, `i`), async ({ message, client, logger, context }) => {
app.event('app_mention', async ({ event, say, client, logger }) => {
  if (!event.text.startsWith(`<@${BOT_ID}>`)) {
    return
  }

  if ('user' in event && event.user !== undefined) {
    // Not all messages have a user FIXME

    let context
    let msg = ''

    if (context = event.text.match(RegExp(`^<@${BOT_ID}> help`, `i`))) {
      msg = MSGS.joinChannel

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
          const usMaStats = maStats(event.user, usMa.ma)
          blocks = userMaBlocks(event.user, usMaStats, usMa.watching)
          await say({blocks})
          break
        case `channel`:
          const chMa = getMa(event.channel)
          if (chMa === undefined || chMa.ma == undefined) { break }
          const chMaStats = maStats(event.channel, chMa.ma)
          blocks = channelMaBlocks(event.channel, chMaStats, chMa.watching)
          await say({blocks: blocks as SayArguments})
          break
        default:
          console.error(msg = 'could not get status. check your command?', event)
          await say(msg)
      }
      return
    }

    if (msg.length === 0) {
      msg = 'check your command ;3' // FIXME lol proper error handling
    }

    await client.chat.postMessage({ // .postEphemeral
      channel: event.channel,
      user: event.user,
      text: msg,
    })

  }
})

