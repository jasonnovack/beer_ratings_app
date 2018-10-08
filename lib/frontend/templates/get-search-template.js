const fs = require('fs');

module.exports = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const css = await getFile('./lib/frontend/index.css');
      const js = await getFile('./lib/frontend/frontend.js');
      let html = `<html>`;
      
      html += `<head>`;

      html += `<link rel="icon" type="image/png" href="https://s3.amazonaws.com/beerratings/favicon.png">`;
      html += `<link rel="apple-touch-icon" href="https://s3.amazonaws.com/beerratings/touch-icon-iphone-square.png">`;
      html += `<link rel="apple-touch-icon" sizes="152x152" href="https://s3.amazonaws.com/beerratings/touch-icon-ipad-square.png">`;
      html += `<link rel="apple-touch-icon" sizes="167x167" href="https://s3.amazonaws.com/beerratings/touch-icon-ipad-retina-square.png">`;
      html += `<link rel="apple-touch-icon" sizes="180x180" href="https://s3.amazonaws.com/beerratings/touch-icon-iphone-retina-square.png">`;
      html += `<link rel="icon" sizes="192x192" href="https://s3.amazonaws.com/beerratings/android-icon-square.png">`;
      html += `<meta name="msapplication-square310x310logo" content="https://s3.amazonaws.com/beerratings/microsoft-icon-square.png">`;
      
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
      html += `<div class='modal-content' id='modal-content'>`;
      html += `<div class='modal-info' id='modal-info'></div>`;
      html += `<div><form class='rating-form' id='rating-form'>`;
      html += `<input type='number' id='rating-score' name='rating-score' pattern='[0-9]*' min='1' max='10' placeholder='Score (1-10)' required />`;
      html += `<input type='date' id='rating-date' name='rating-score' min='2000-01-01' required />`;
      html += `<input type='text' id='rating-comment' placeholder='Comment (optional)' />`;
      html += `<input type='password' id='rating-password' placeholder='Password' required />`;
      html += `</form></div>`;
      html += `</div>`;
      html += `</div>`;

      html += `<script type='text/javascript'>const env = '${req.environment}'; ${js}</script>`;
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