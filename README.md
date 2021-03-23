# @streamBOOT

a @streambot reboot

because @streambot is in so many channels, it can actually know a lot about
slack club.  this is great for the community game designers because we want to
recommend channels to people. that's why this bot is rebooted to track message
frequency across channels with [some statistical analysis (this is the algorithm implemented)](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average).


## how does it work?

* we keep exponential moving averages (EMA) of message frequency over time
* an EMA's x-axis is quantized into windows of 30 seconds
* an EMA's y-axis charts the EMA within each x-axis window of time

* one may query this project's API
* a JSON object that represents an EMA for a slack resource (users and channels) will be returned

here is an example EMA:

```json
{
    "chId": "C01RNH6K9JS",
    "average": 10,
    "variance": 0,
    "deviation": 0,
    "forecast": 0
}
```

here is another example EMA (it is the same as the first but has "decayed" with time):

```json
{
    "id": "C01RNH6K9JS",
    "average": 0.00012257550710530237,
    "variance": 0.00012256048235036022,
    "deviation": 0.011070703787490668,
    "forecast": -8.830486419323291e-05
}
```


## if you want to test it out


"okay but how can i actually use this right now?"

1. go to [#streamboot-dev](https://hackclub.slack.com/archives/C01RNH6K9JS)
2. post something OR don't post anything
3. wait 30 seconds
4. check these endpoints
5. GOTO step2


endpoints:

* [GET /api/convos](https://sb2.fogg.house/api/convos) - all tracked resources
* [GET /api/convos/:id](https://sb2.fogg.house/api/convo/C01RNH6K9JS) - grab a single resource

P.S. these endpoints are temporary and literally running on my personal laptop behind cloudlfare
