<img src="https://cloud-k25eaalth-hack-club-bot.vercel.app/0dzuu6xmx4aaorbz.jpeg" width="200px" align="right">

# @Paul Bunyan

_Work inspired by [@streambot](https://github.com/hackclub/streambot)._

@Paul Bunyan (pictured to the right) logs everything happening in the Hack Club
Slack. Posts, reactions, etc. all get tracked so he can help you understand
where the activity in the Slack is.

## How to use

Ask Paul Bunyan what's happening in the Slack by typing `/sup`– he'll respond with a list of 5 recently active channels in the last 2 hours:

![](https://cloud-k25eaalth-hack-club-bot.vercel.app/1screen_shot_2021-04-30_at_17.36.13.png)

---

Want to query a specific channel, user, or emoji?

You can run any of these:

- `/supwit @orpheus` _Where has @orpheus been active recently?_
- `/supwit 30 @orpheus` _Where has @orpheus been active in the last 30 minutes?_
- `/supwit :yay:` _Where has the :yay: reaction been used recently?_
- `/supwit 45 :yay:` _Where has the :yay: reaction been used in the last 45 min?_
- `/supwit #lounge` _What's happening in #lounge?_
- `/supwit 60 #lounge` _What's been happening in #lounge over the past 60 min_

## What can @Paul Bunyan see?

If you want to opt-in or opt-out of logging (for yourself or a channel), type
`@Paul Bunyan help`– he's an all-around great guy and will do his best to
accomodate whatever you're trying to do.

## Reasoning and background

Community game designer

## Future work

### Stats API

We could build some pretty great graphs & analytics tools if we could query the data we're storing. You can find a work-in-progress example of this at http://streamboot-bot.herokuapp.com.

### Websockets

In the future we might add websocket support to post out to other applications when a new reaction or message is posted in the Slack. You can see an example of how we'd use that info on our [Slack Join Page](https://hackclub.com/slack)

![](https://cloud-1f3dc5q2u-hack-club-bot.vercel.app/0screen_shot_2021-04-30_at_18.11.01.png)
