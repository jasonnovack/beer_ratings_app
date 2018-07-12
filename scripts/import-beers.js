const request = require("request");

let beers = [
	{
		'name': 'Yuengling Traditional Lager',
    'rating': 10
	},
  {
    'name': 'Gulden Draak',
    'rating': 10
  }
];

const looper = async () => {
  let matches = [];
  let noMatches = [];
  for (let beer of beers) {
    try {
      let response = await getBeer(beer);
      matches.push(response);
    } catch(e) {
      noMatches.push(e);
    }
  }
  console.log('matches:', JSON.stringify(matches, null, 2));
  console.log('no matches:', JSON.stringify(noMatches, null, 2));
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
      if (error) {
        console.error(error);
        reject(beer);
      } else {
        let items = body[0].data.results.items.filter(item => item.beer.name.toLowerCase() === beer.name.toLowerCase());
        if (items.length === 1) {
          let details = await getDetails(beer, items[0].beer.id);
          resolve({
            'id': items[0].beer.id,
            'name': items[0].beer.name,
            'rating': beer.rating,
            'brewer': details.data.beer.brewer.name,
            'brewerType': details.data.beer.brewer.type,
            'city': details.data.beer.brewer.city,
            'state': details.data.beer.brewer.state.name,
            'country': details.data.beer.brewer.country.name,
            'style': details.data.beer.style.name,
            'styleParent': details.data.beer.style.parent.name,
            'abv': details.data.beer.abv,
            'ibu': details.data.beer.ibu,
            'rateBeerScore': details.data.beer.overallScore
          });
        } else {
          reject(beer);
        }
      }
    });
  });
};

const getDetails = async (beer, id) => {
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
        query: `query {beer(id: ${id}) {id overallScore name abv ibu brewer {name type country {name} city state {name}} style {name parent {name}}}}`,
        variables: '{}',
        operationName: null },
        json: true
      };

      request(options, (error, response, body) => {
        if (error) {
          console.error(error);
          reject(beer);
        } else {
          resolve(body);
        }
      });
  })
}

looper();
