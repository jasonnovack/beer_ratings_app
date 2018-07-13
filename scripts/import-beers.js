const request = require("request");
const fs = require('fs');
const parse = require('csv-parse');
const delay = require('delay');

const looper = async () => {
  let ratings = await loadRatings();

  let matches = [];
  let noMatches = [];
  for (let rating of ratings) {
    try {
      await delay(500);
      let beerWithId = await getBeer(rating);
      let beerWithDetails = await getDetails(beerWithId);
      matches.push(beerWithDetails);
    } catch(e) {
      noMatches.push(e);
    }
  }
  console.log('matches:', JSON.stringify(matches, null, 2));
  console.log('no matches:', JSON.stringify(noMatches, null, 2));
};

const loadRatings = async () => {
  return new Promise((resolve, reject) => {
    let beers = [];
    const inputFile = './scripts/ratings-test.csv';

    var parser = parse({delimiter: ','}, (err, data) => {
      for (let line of data) {
        beers.push({
          'createdAt': Date.parse(line[0]),
          'name': line[1],
          'score': line[2],
          'comment': line[3]
        });
      }
      resolve(beers);
    });
    fs.createReadStream(inputFile).pipe(parser);
  });
};

const getBeer = async (beer) => {
  console.log('getBeer', beer.name);
  return new Promise(async (resolve, reject) => {
    var options = { 
      method: 'POST',
      url: 'https://beta.ratebeer.com/v1/api/graphql/',
      headers: { 
       'Cache-Control': 'no-cache',
       'origin': 'https://www.ratebeer.com',
       'Content-Type': 'application/json',
       'Accept': 'application/json' 
      },
      body: [
        {
          operationName: 'beerSearch',
          variables: { query: beer.name, first: 7 },
          query: 'query beerSearch($query: String, $first: Int) {results: beerSearch(query: $query, first: $first) {items {beer {id name}}}}'
        }
      ],
      json: true 
    };
    request(options, async (error, response, body) => {
      if (error) {
        console.error(error);
        reject(beer);
      } else {
        let items = body[0].data.results.items.filter(item => item.beer.name.toLowerCase() === beer.name.toLowerCase());
        if (items.length === 1) {
          beer.id = items[0].beer.id;
          resolve(beer);
        } else {
          reject(beer);
        }
      }
    });
  });
};

const getDetails = async (beer) => {
  return new Promise(async (resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'https://beta.ratebeer.com/v1/api/graphql/',
      headers: {
        'Cache-Control': 'no-cache',
        origin: 'https://www.ratebeer.com',
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {
        query: `query {beer(id: ${beer.id}) {id overallScore name abv ibu brewer {name type country {name} city state {name}} style {name parent {name}}}}`,
        variables: '{}',
        operationName: null },
        json: true
      };

      request(options, (error, response, body) => {
        if (error) {
          console.error(error);
          reject(beer);
        } else {
          if (body && body.data && body.data.beer) {
            if (body.data.beer.brewer) {
              if (body.data.beer.brewer.name && body.data.beer.brewer.name.length > 0) {
                beer.brewer = body.data.beer.brewer.name;
              }
              if (body.data.beer.brewer.type && body.data.beer.brewer.type.length > 0) {
                beer.brewerType = body.data.beer.brewer.type;
              }
              if (body.data.beer.brewer.city && body.data.beer.brewer.city.length > 0) {
                beer.city = body.data.beer.brewer.city;
              }
              if (body.data.beer.abv) {
                beer.abv = body.data.beer.abv;
              }
              if (body.data.beer.ibu) {
                beer.ibu = body.data.beer.ibu;
              }
              if (body.data.beer.overallScore) {
                beer.rateBeerScore = body.data.beer.overallScore;
              }           
            }
            if (body.data.beer.brewer.state && body.data.beer.brewer.state.name && body.data.beer.brewer.state.name.length > 0) {
              beer.state = body.data.beer.brewer.state.name;
            }
            if (body.data.beer.brewer.country.name && body.data.beer.brewer.country.name.length > 0) {
              beer.country = body.data.beer.brewer.country.name;
            }
            if (body.data.beer.style.name && body.data.beer.style.name.length > 0) {
              beer.style = body.data.beer.style.name;
            }
            if (body.data.beer.style.parent.name && body.data.beer.style.parent.name.length > 0) {
              beer.styleParent = body.data.beer.style.parent.name;
            }
          }
          resolve(beer);
        }
      });
  })
}

looper();