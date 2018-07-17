const fs = require('fs');

module.exports = async (obj) => {
  return new Promise(async (resolve, reject) => {
    try {
      const css = await getCss();
      let html = `<html><head><style>${css}</style></head><body>`;
      obj.forEach(item => {
        html += `<div>Beer: ${item.name}</div>`;
      });
      html += '</body></html>';
      resolve(html);
    } catch (err) {
      reject(err);
    }
  });
};

const getCss = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./lib/index.css', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};