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
    if (req.body) {
      if (req.body.createdAt && req.body.createdAt.length > 0) {
        item.createdAt = Number(req.body.createdAt);
      }
      if (req.body.name && req.body.name.length > 0) {
        item.name = req.body.name;
      }
      if (req.body.score && req.body.score.length > 0) {
        item.score = Number(req.body.score);
      }
      if (req.body.comment && req.body.comment.length > 0) {
        item.comment = req.body.comment;
      }
      if (req.body.id && req.body.id.length > 0) {
        item.id = Number(req.body.id);
      }
      if (req.body.abv && req.body.abv.length > 0) {
        item.abv = Number(req.body.abv);
      }
      if (req.body.ibu && req.body.ibu.length > 0) {
        item.ibu = Number(req.body.ibu);
      }
      if (req.body.rateBeerScore && req.body.rateBeerScore.length > 0) {
        item.rateBeerScore = Number(req.body.rateBeerScore);
      }
      if (req.body.image && req.body.image.length > 0) {
        item.image = req.body.image;
      }
      if (req.body.brewer && req.body.brewer.length > 0) {
        item.brewer = req.body.brewer;
      }
      if (req.body.brewerType && req.body.brewerType.length > 0) {
        item.brewerType = req.body.brewerType;
      }
      if (req.body.streetAddress && req.body.streetAddress.length > 0) {
        item.streetAddress = req.body.streetAddress;
      }
      if (req.body.city && req.body.city.length > 0) {
        item.city = req.body.city;
      }
      if (req.body.state && req.body.state.length > 0) {
        item.state = req.body.state;
      }
      if (req.body.country && req.body.country.length > 0) {
        item.country = req.body.country;
      }
      if (req.body.zip && req.body.zip.length > 0) {
        item.zip = req.body.zip;
      }
      if (req.body.brewerId && req.body.brewerId.length > 0) {
        item.brewerId = Number(req.body.brewerId);
      }
      if (req.body.brewerImage && req.body.brewerImage.length > 0) {
        item.brewerImage = req.body.brewerImage;
      }
      if (req.body.styleId && req.body.styleId.length > 0) {
        item.styleId = Number(req.body.styleId);
      }
      if (req.body.style && req.body.style.length > 0) {
        item.style = req.body.style;
      }
      if (req.body.styleParent && req.body.styleParent.length > 0) {
        item.styleParent = req.body.styleParent;
      }
    }
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
    const html = await getSearchTemplate(req);
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