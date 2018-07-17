const request = require('request');
const db = require('./db');
const getBeersTemplate = require('./get-beers-template');
const postSearchTemplate = require('./post-search-template');

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

const postBeer = async (req, res) => {
  let item = {
    'createdAt': req.body.createdAt,
    'name': req.body.name,
    'score': req.body.score,
    'comment': req.body.comment,
    'id': req.body.id,
    'brewer': req.body.brewer,
    'brewerType': req.body.brewerType,
    'city': req.body.city,
    'state': req.body.state,
    'country': req.body.country,
    'style': req.body.style,
    'styleParent': req.body.styleParent
  }
  try {
    let response = await db.postBeer(req);
    res.send(response);
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

const postSearch = async (req, res) => {
  try {
    let response = await searchRateBeer(req.body.query);
    const html = await postSearchTemplate(response);
    res.set('Content-Type', 'text/html');
    res.send(html);
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
        resolve(body[0].data.results.items);
      }
    });
  });
};

module.exports = {
  'getBeers': getBeers,
  'postBeer': postBeer,
  'postSearch': postSearch
}