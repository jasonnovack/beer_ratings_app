const request = require('request');
const db = require('./db');
const pwdb = require('./pw-db');
const getBeersTemplate = require('./frontend/templates/get-beers-template');
const getSearchTemplate = require('./frontend/templates/get-search-template');

const getBeers = async (req, res) => {
	try {
    let response = await db.listByCreatedAt(req);
    const html = await getBeersTemplate(response);
    res.set('Content-Type', 'text/html');
    res.send(html);  
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

const authCheck = async(req, res) => {
  let valid = await pwdb.listPasswords(req);
  let allow = false;
  valid.forEach(item => {
    if (item.password === req.body.password) {
      allow = true;
      return allow;
    }
  });
  return allow;
};

const postBeer = async (req, res) => {
  let authorized = await authCheck(req);
  if (authorized) {
    let item = {};
    if (req.body && req.body.createdAt) {
      item.createdAt = req.body.createdAt;
    }
    if (req.body && req.body.name) {
      item.name = req.body.name;
    }
    if (req.body && req.body.score) {
      item.score = req.body.score;
    }
    if (req.body && req.body.comment) {
      item.comment = req.body.comment;
    }
    if (req.body && req.body.id) {
      item.id = req.body.id;
    }
    if (req.body && req.body.abv) {
      item.abv = req.body.abv;
    }
    if (req.body && req.body.ibu) {
      item.ibu = req.body.ibu;
    }
    if (req.body && req.body.rateBeerScore) {
      item.rateBeerScore = req.body.rateBeerScore;
    }
    if (req.body && req.body.image) {
      item.image = req.body.image;
    }
    if (req.body && req.body.brewer) {
      item.brewer = req.body.brewer;
    }
    if (req.body && req.body.brewerType) {
      item.brewerType = req.body.brewerType;
    }
    if (req.body && req.body.streetAddress) {
      item.streetAddress = req.body.streetAddress;
    }
    if (req.body && req.body.city) {
      item.city = req.body.city;
    }
    if (req.body && req.body.state) {
      item.state = req.body.state;
    }
    if (req.body && req.body.country) {
      item.country = req.body.country;
    }
    if (req.body && req.body.zip) {
      item.zip = req.body.zip;
    }
    if (req.body && req.body.brewerId) {
      item.brewerId = req.body.brewerId;
    }
    if (req.body && req.body.brewerImage) {
      item.brewerImage = req.body.brewerImage;
    }
    if (req.body && req.body.styleId) {
      item.styleId = req.body.styleId;
    }
    if (req.body && req.body.style) {
      item.style = req.body.style;
    }
    if (req.body && req.body.styleParent) {
      item.styleParent = req.body.styleParent;
    }
    req.body = {
      "createdAt": 1185235200000,
      "name": "Dogfish Head Midas Touch Golden Elixir",
      "score": "6",
      "id": "7293",
      "abv": 9,
      "ibu": 12,
      "rateBeerScore": 86.61520754121675,
      "image": "https://res.cloudinary.com/ratebeer/image/upload/w_120,c_limit,d_beer_icon_default.png,f_auto/beer_7293.jpg",
      "brewer": "Dogfish Head Brewery",
      "brewerType": "Microbrewery",
      "streetAddress": "6 Cannery Village Center",
      "city": "Milton",
      "state": "Delaware",
      "country": "United States",
      "zip": "19968",
      "brewerId": "198",
      "brewerImage": "https://res.cloudinary.com/ratebeer/image/upload/w_150,c_limit,d_brewerdefault_hk6nu1.png,f_auto/brew_198.jpg",
      "styleId": "59",
      "style": "Traditional Ale",
      "styleParent": "Traditional, Spice, Other",
      "b": "b",
      "modifiedAt": 1532056806819
    };
    try {
      console.log('post body', req.body);
      let response = await db.postBeer(req);
      res.send(response);
    } catch (e) {
      console.error(e);
      res.done(e, null);
    }
  }
};

const getSearch = async (req, res) => {
  try {
    const html = await getSearchTemplate();
    res.set('Content-Type', 'text/html');
    res.send(html);  
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

const postSearch = async (req, res) => {
  console.log(JSON.stringify(req, null, 2));
  console.log('postSearch');
  try {
    let searchResponse = await searchRateBeer(req.body.query);
    const ids = searchResponse.map(item => {
      return item.beer.id;
    });
    let dbResponse = await db.batchGet(req, ids);
    searchResponse.forEach(searchItem => {
      dbResponse.forEach(dbItem => {
        if (searchItem.beer.id === dbItem.id) {
          searchItem.rating = {
            'score': dbItem.score,
            'createdAt': dbItem.createdAt
          }
        }
      });
    });
    console.log(JSON.stringify(searchResponse, null, 2));
    res.send(searchResponse);
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

const searchRateBeer = async (query) => {
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
          variables: { 'query': query, 'first': 7 },
          query: 'query beerSearch($query: String, $first: Int) {results: beerSearch(query: $query, first: $first) {items {beer {id overallScore name abv ibu imageUrl brewer {id name type imageUrl country {name} city state {name} streetAddress zip} style {name id parent {name}}}}}}'
        }
      ],
      json: true 
    };
    request(options, async (error, response, body) => {
      if (error || !body[0] || !body[0].data || !body[0].data.results) {
        console.error(error);
        reject(beer);
      } else {
        resolve(body[0].data.results.items);
      }
    });
  });
};

module.exports = {
  'getBeers': getBeers,
  'postBeer': postBeer,
  'getSearch': getSearch,
  'postSearch': postSearch
}