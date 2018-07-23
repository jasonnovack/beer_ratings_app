const fs = require('fs');
const parse = require('csv-parse');
const _ = require('underscore');

const loadRatings = async () => {
  let beers = [];
  const inputFile = `./scripts/failures-prod-1531843009697.json`;

  const obj = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  obj.forEach(item => {
    beers.push({
      'name': item.name,
      'score': item.score,
      'date': new Date(item.createdAt).toLocaleString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric'})
    })
  });

  writeFile(`./scripts/failures-cleaned.json`, JSON.stringify(beers, null, 2));
};

const writeFile = (fileName, txt) => {
  fs.writeFile(fileName, txt, err => {
      if(err) {
       console.error(err);
    } else {
      console.log('wrote file: ' + fileName);
   }
 });
};

loadRatings();