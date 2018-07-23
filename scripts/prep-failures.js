const fs = require('fs');
const parse = require('csv-parse');
const _ = require('underscore');

const importBeers = async () => {
  let ratings = await loadRatings();

  let matches = [];
  let noMatches = [];
  let count = 0;
  for (let rating of ratings) {
    try {
      let beerWithId = await getBeer(rating);
      let beerWithDetails = await getDetails(beerWithId);
      matches.push(beerWithDetails);
    } catch(e) {
      noMatches.push(e);
    }
  }
  batchImportItems(matches);
  writeFile(`./scripts/failures-cleaned.json`, JSON.stringify(noMatches, null, 2));

  console.log('matches:', JSON.stringify(matches, null, 2));
  console.log('no matches:', JSON.stringify(noMatches, null, 2));
  console.log(` ${matches.length} Matches and ${noMatches.length} No Matches`);
};

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