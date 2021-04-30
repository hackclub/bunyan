
var data = {
  movingAverages: [],
  updatedAt: null
}

var chart
var chartOptions = {}

const lavalampColors = [
  { r: 236, g: 9, b: 48 },
  { r: 205, g: 84, b: 147 },
  { r: 205, g: 147, b: 84 },
  { r: 96, g: 20, b: 162 },
  { r: 96, g: 20, b: 162 },
  { r: 96, g: 20, b: 162 },
  { r: 96, g: 20, b: 162 },
  { r: 96, g: 20, b: 162 },
  { r: 96, g: 20, b: 162 },
]
function rgba(c, a) {
  return `rgba(${[c.r, c.g, c.b, a].join(',')})`
}
function colorFromString(string) {
  return Please.make_color({ seed: string, format: 'rgb' })[0]
}

function run() {
  let success = false
  fetch(endpoint('demo'))
    .then(r =>
      r.json()
    ).then(movingAverages => {
      if (movingAverages) {
        data.updatedAt = Date.now()
        data.rawData = movingAverages
        data.channelData = {}
        movingAverages
          .filter(c => c.slack_id[0] === 'C')
          .forEach(ma => {
            if (!data.channelData[ma['slack_id']]) {
              data.channelData[ma['slack_id']] = {
                score: 0,
                points: []
              }
            }
            data.channelData[ma.slack_id].score += Math.min(Math.exp(ma.average), 50)
            data.channelData[ma.slack_id].points.push({
              y: Math.min(Math.exp(ma.average), 50),
              x: ma.ten_min_timestamp
            })
          })
        success = true
      }
    }).finally(() => {
      // render all the data (success or not)
      const updateEl = document.querySelector('.updated')
      if (data.updatedAt) {
        let date = new Date(data.updatedAt)
        updateEl.innerHTML = `Latest data pulled at <strong>${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</strong>`
      } else {
        updateEl.innerHTML = `<em>(Failed to load latest data, will retry shortly)</em>`
      }

      const resultEl = document.querySelector('.results')
      const dataEl = document.querySelector('.raw-data')
      if (data.channelData) {
        if (!document.querySelector('canvas')) {
          const el = document.createElement('canvas')
          el.width = 400
          el.height = 400
          resultEl.appendChild(el)
          chartOptions.type = 'line'
          chartOptions.options = {
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'minute'
                }
              },
              y: {
                type: 'logarithmic'
              }
            },
            animations: {
              tension: {
                duration: 3000,
                easing: 'linear',
                from: 1,
                to: 0.5,
                loop: true
              }
            },
            plugins: {
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x'
                },
                zoom: {
                  enabled: true,
                  mode: 'x',
                }
              }
            }
          }
          const ctx = el.getContext('2d')
          chart = new Chart(ctx, chartOptions)
        }

        // update the graph
        chartOptions.data.datasets = []

        const channelPromises = Object.keys(data.channelData).map(async (channelID, index) => {
          if (index < 10) {
            chartOptions.data.datasets.push({
              label: await getChannelName(channelID),
              data: data.channelData[channelID].points,
              fill: true,
              fillOpacity: 0.5,
              borderColor: rgba(colorFromString(channelID), 0.8),
              backgroundColor: rgba(colorFromString(channelID), 0.3),
              tension: 0.5,
            })
          }
        })
        Promise.all(channelPromises).then(() => chart.update('none'))

        dataEl.innerHTML = `// ${endpoint('demo')}\n${JSON.stringify(data.rawData, null, 2)}`
      } else {
        resultEl.innerHTML = `⚠️ something has gone wrong`
        dataEl.innerHTML = `⚠️ something has gone wrong`
      }
    })
}

// run()

  // setInterval(run, 1000 * 15) // ever 15 seconds, update the list