const request = require("request");
const fs = require('fs');
const parse = require('csv-parse');
const delay = require('delay');
const AWS = require('aws-sdk');
const _ = require('underscore');

const env = 'dev';

const importBeers = async () => {
  let ratings = await loadRatings();

  let matches = [];
  let noMatches = [];
  let count = 0;
  for (let rating of ratings) {
    try {
      count += 1;
      await delay(100);
      console.log(`${count}/${ratings.length} : ${rating.name}`);
      let beerWithId = await getBeer(rating);
      let beerWithDetails = await getDetails(beerWithId);
      matches.push(beerWithDetails);
    } catch(e) {
      noMatches.push(e);
    }
  }
  batchImportItems(matches);
  writeFile(`./scripts/failures-${env}-${_.now()}.json`, JSON.stringify(noMatches, null, 2));

  console.log('matches:', JSON.stringify(matches, null, 2));
  console.log('no matches:', JSON.stringify(noMatches, null, 2));
  console.log(` ${matches.length} Matches and ${noMatches.length} No Matches`);
};

const loadRatings = async () => {
  return new Promise((resolve, reject) => {
    let beers = [];
    const inputFile = `./scripts/ratings-${env}.csv`;

    var parser = parse({delimiter: ','}, async (err, data) => {
      for (let line of data) {
        let item = {
          'b': 'b',
          'createdAt': Date.parse(line[0]),
          'name': line[1],
          'score': line[2]
        };
        if (line[3] !== '') {
          item.comment = line[3];
        }
        beers.push(item);
      }
      resolve(beers);
    });
    fs.createReadStream(inputFile).pipe(parser);
  });
};

const getBeer = async (beer) => {
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
      if (error || !body[0] || !body[0].data || !body[0].data.results) {
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
            if (body.data.beer.abv) {
              beer.abv = body.data.beer.abv;
            }
            if (body.data.beer.ibu) {
              beer.ibu = body.data.beer.ibu;
            }
            if (body.data.beer.overallScore) {
              beer.rateBeerScore = body.data.beer.overallScore;
            }
            if (body.data.beer.imageUrl && body.data.beer.imageUrl.length > 0) {
              beer.image = body.data.beer.imageUrl;
            }
            if (body.data.beer.brewer) {
              if (body.data.beer.brewer.name && body.data.beer.brewer.name.length > 0) {
                beer.brewer = body.data.beer.brewer.name;
              }
              if (body.data.beer.brewer.type && body.data.beer.brewer.type.length > 0) {
                beer.brewerType = body.data.beer.brewer.type;
              }
              if (body.data.beer.brewer.streetAddress && body.data.beer.brewer.streetAddress.length > 0) {
                beer.streetAddress = body.data.beer.brewer.streetAddress;
              }
              if (body.data.beer.brewer.city && body.data.beer.brewer.city.length > 0) {
                beer.city = body.data.beer.brewer.city;
              }
              if (body.data.beer.brewer.state && body.data.beer.brewer.state.name && body.data.beer.brewer.state.name.length > 0) {
                beer.state = body.data.beer.brewer.state.name;
              }
              if (body.data.beer.brewer.country.name && body.data.beer.brewer.country.name.length > 0) {
                beer.country = body.data.beer.brewer.country.name;
              }
              if (body.data.beer.brewer.streetAddress && body.data.beer.brewer.streetAddress.length > 0) {
                beer.streetAddress = body.data.beer.brewer.streetAddress;
              }
              if (body.data.beer.brewer.zip && body.data.beer.brewer.zip.length > 0) {
                beer.zip = body.data.beer.brewer.streetAddress;
              }
              if (body.data.beer.brewer.id && body.data.beer.brewer.id.length > 0) {
                beer.brewerId = body.data.beer.brewer.id;
              }
              if (body.data.beer.brewer.imageUrl && body.data.beer.brewer.imageUrl.length > 0) {
                beer.brewerImage = body.data.beer.brewer.imageUrl;
              }
            }
            if (body.data.beer.style) {
              if (body.data.beer.style.id && body.data.beer.style.id.length > 0) {
                beer.styleId = body.data.beer.style.id;
              }
              if (body.data.beer.style.name && body.data.beer.style.name.length > 0) {
                beer.style = body.data.beer.style.name;
              }
              if (body.data.beer.style.parent.name && body.data.beer.style.parent.name.length > 0) {
                beer.styleParent = body.data.beer.style.parent.name;
              }
            }
          }
          resolve(beer);
        }
      });
  })
};

const batchImportItems = async (matches) => {
  let chunked = _.chunk(matches, 25);
  for (let chunk of chunked) {
    let putRequests = chunk.map(item => {
      return {
        'PutRequest': {
          'Item': item
        }
      }
    });
    let params = {
      'RequestItems': {}
    };
    params.RequestItems[`beer-${env}-Beer`] = putRequests;
    try {
      await batchWrite(params);
    } catch (err) {
      console.log('err', err);
    }
  }
};

const batchWrite = async (params) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
  dynamodb.batchWrite(params, function(err, data) {
    if (err) {
      console.log('error', err);
    } else {
      console.log('good', data);
    }
    return;
  });
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

importBeers();