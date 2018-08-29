const fs = require('fs');

const chartScript = async () => { 
  return `var ctx = document.getElementById('chart');
    var myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Ratings',
            data: [
              {
                x: 1,
                y: 33
              },
              {
                x: 2,
                y: 74
              },
              {
                x: 3,
                y: 205
              },
              {
                x: 4,
                y: 458
              },
              {
                x: 5,
                y: 666
              },
              {
                x: 6,
                y: 717
              },
              {
                x: 7,
                y: 608
              },
              {
                x: 8,
                y: 324
              },
              {
                x: 9,
                y: 83
              },
              {
                x: 10,
                y: 10
              },
            ],
            fill: false,
            borderColor: '#00BCE8',
            borderWidth: 3,
            pointRadius: 0
          },
          {
            label: 'Normal',
            data: [
              {
                x: 1,
                y: 20
              },
              {
                x: 2,
                y: 83
              },
              {
                x: 3,
                y: 246
              },
              {
                x: 4,
                y: 508
              },
              {
                x: 5,
                y: 729
              },
              {
                x: 6,
                y: 729
              },
              {
                x: 7,
                y: 508
              },
              {
                x: 8,
                y: 246
              },
              {
                x: 9,
                y:83
              },
              {
                x: 10,
                y: 20
              },
            ],
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
              fontSize: 17
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

module.exports = async (obj) => {
  return new Promise(async (resolve, reject) => {
    try {
      let chart = await chartScript();

      const css = await getFile('./lib/frontend/index.css');
      let html = `<html><head>`;
      html += `<style>${css}</style>`;
      html += `<meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width">`;
      html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js" type="text/javascript"></script></head><body>`;
      html += `</head>`;
      // obj.forEach(item => {
      //   html += `<div>${item.score}: ${item.count}</div>`;
      // });
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