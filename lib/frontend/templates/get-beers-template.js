const fs = require('fs');

module.exports = async (obj) => {
  return new Promise(async (resolve, reject) => {
    try {
      const css = await getFile('./lib/frontend/index.css');
      const js = await getFile('./lib/frontend/frontend.js');
      let html = `<html><head><style>${css}</style></head><body>`;
      obj.forEach(item => {
        html += `<div>Beer: ${item.name}</div>`;
      });
      html += `<script type='text/javascript'>${js}</script>`;
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