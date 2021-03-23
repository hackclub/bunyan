import { GenericMessageEvent } from '@slack/bolt'
import app from './server'


const BOT_NAME = `streamBOOT`

const BOT_ID = `U01S7UUCB89`

const BOT_CHID = `CGSEAP135`

const USER_IDS = {
  zrl:   'U0266FRGP',
  zfogg: 'U01DV5F30CF',
}

const MSGS = {
  joinChannel: `:wave: hi! :wave: i'm a bot built by <@${USER_IDS.zrl}> and <@${USER_IDS.zfogg}> that streams channel activity to <#${BOT_CHID}> so people can easily discover new channels.

don't want your channel (or your account) to be part of this? that's ok! just type \`<@${BOT_ID}> disable me\` to have me ignore all of your messages or \`<@${BOT_ID}> disable channel\` to have me ignore this whole channel.

if you want to re-enable streaming, you can type \`<@${BOT_ID}> enable me\` or \`<@${BOT_ID}> enable channel\` and if you want to check whether i'm streaming, you can type \`<@${BOT_ID}> status me\` or \`<@${BOT_ID}> status channel\`.

i'll never stream private messages, group chats, or private channels. message <@${USER_IDS.zrl}> or <@${USER_IDS.zfogg}> if you have any questions. happy hacking!`,

  disableMe: `i will now ignore your messages`,
  enableMe:  `i will now stream your messages`,

  disableChannel: `i will now ignore this channel's messages`,
  enableChannel:  `i will now stream this channel's messages`,

  statusMeIgnoring:  `i am ignoring your messages`,
  statusMeListening: `i am streaming your messages`,

  statusChannelIgnoring:  `i am ignoring this channel's messages`,
  statusChannelListening: `i am streaming this channel's messages`,
}


// {{{ FIXME: let's use Redis for all of this
export type Watching = {
  [key: string]: boolean
}
const watching: Watching = {}

async function setWatching(id: string, onOff: boolean) {
  watching[id] = onOff
  return watching[id]
}

async function statusWatching(id: string) {
  return watching[id]
}
// }}}


//app.message(RegExp(`^<@${BOT_ID}> help`, `i`), async ({ message, client, logger, context }) => {
app.event('app_mention', async ({ event, say, client, logger }) => {
  if ('user' in event && event.user !== undefined) {
    // Not all messages have a user FIXME

    let context
    let msg = ''

    if (context = event.text.match(RegExp(`^<@${BOT_ID}> help`, `i`))) {
      logger.info('user tryna get help', event)
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
    }

    await client.chat.postMessage({ // .postEphemeral
      channel: event.channel,
      user: event.user,
      text: msg,
    })

  }
})

