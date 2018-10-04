const fs = require('fs');
const _ = require('underscore');

let totalCount = 0;
let averageScore = 0;
let stDevScore = 0;

const chartScript = async (tallies) => {
  let data = _.map(tallies, (tally) => {
    return {
      'x': tally.score,
      'y': tally.count
    };
  });

  let norm = [];
  for (s=1; s<=10; s++) {
    norm.push({
      'x': s,
      'y': normDist(s, averageScore, stDevScore)*totalCount
    });
  }
  console.log('NORM----', norm)

  return `var ctx = document.getElementById('chart');
    var myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Ratings',
            data: ${JSON.stringify(data)},
            fill: false,
            borderColor: '#00BCE8',
            borderWidth: 3,
            pointRadius: 0
          },
          {
            label: 'Normal',
            data: ${JSON.stringify(norm)},
            fill: false,
            borderColor: 'rgb(238, 238, 238)',
            borderWidth: 3,
            pointRadius: 0
          }
        ]
      },
      options: {
        global: {
          defaultFontColor: '#162D3D',
          defaultFontFamily: 'sans-serif',
          defaultFontSize: 13,
        },
        layout: {
          padding: 17
        },
        title: {
          display: true,
          text: '🍺 ${totalCount} 🍺',
          fontSize: 54
        },
        scales: {
          yAxes: [{
            display: false,
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: '#00BCE8',
              fontSize: 17,
              min: 1,
              max: 10,
              stepSize: 1
            },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        legend: {
          display: false
        },
        maintainAspectRatio: false
      }
    });`
};

const stats = (tallies) => {
  totalCount = _.reduce(tallies, (s, tally) => {
    return s + tally.count;
  }, 0);
  
  let sumProduct = _.reduce(tallies, (a, tally) => {
    return a + tally.score*tally.count;
  }, 0);
  averageScore = sumProduct/totalCount;

  let squaredDeviations = _.reduce(tallies, (d, tally) => {
    let deviation = tally.score-averageScore;
    let deviationSquared = deviation*deviation*tally.count;
    return d + deviationSquared;
  }, 0);
  stDevScore = Math.sqrt(squaredDeviations/totalCount);
};

const normDist = (x, mean, stDev) => {
  if (stDev === 0) {
    if (x < mean) {
      return 0;
    } else {
      return 1;
    }
  } else {
    return prob = (Math.pow(Math.E,-Math.pow(x-5.5,2)/(2*Math.pow(1.5, 2))))/(1.5*Math.sqrt(2*Math.PI));
  }
};

module.exports = async (tallies) => {
  stats(tallies);
  console.log('TOTALCOUNT---', totalCount);
  console.log('AVERAGESCORE---', averageScore);
  console.log('STDEVSCORE---', stDevScore);

  return new Promise(async (resolve, reject) => {
    try {
      let chart = await chartScript(tallies);

      const css = await getFile('./lib/frontend/index.css');
      let html = `<html><head>`;
      html += `<link rel="shortcut icon" href="https://s3.amazonaws.com/beerratings/favicon.ico" type="image/x-icon">`;
      html += `<style>${css}</style>`;
      html += `<meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width">`;
      html += `<meta charset="UTF-8">`;
      html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js" type="text/javascript"></script></head><body>`;
      html += `</head>`;

      html += `<div class='canvasContainer'><canvas id='chart' class='chart'></canvas></div>`;
      html += `<script>${chart}</script>`;
      html += '</body></html>';
      resolve(html);
    } catch (err) {
      reject(err);
    }
  });
};

const getFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};