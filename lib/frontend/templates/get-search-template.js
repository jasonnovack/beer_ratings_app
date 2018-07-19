const fs = require('fs');

module.exports = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const css = await getFile('./lib/frontend/index.css');
      const js = await getFile('./lib/frontend/frontend.js');
      let html = `<html>`;
      
      html += `<head>`;
      html += `<style>${css}</style>`;
      html += `<meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width">`;
      html += `</head>`;
      
      html += `<body>`;
      html += `<form id='search-form'><input type='search' id='search-input' autocomplete='off' placeholder='Search...'/></form>`;
      html += `<div class='query' id='query'></div>`;
      html += `<div id='search-results'></div>`;
      
      html += `<div id='rating-modal' class='modal'>`;
      html += `<div class='modal-bar'>`;
      html += `<div class='close' id='close-button'>&times;</div>`;
      html += `<div class='title'>New Rating</div>`;
      html += `<div class='save' id='save-button'>SAVE</div>`;
      html += `</div>`;
      html += `<div class='modal-content' id='modal-content'></div>`;
      html += `</div>`;

      html += `<script type='text/javascript'>${js}</script>`;
      html += `</body>`;
      html += `</html>`;
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