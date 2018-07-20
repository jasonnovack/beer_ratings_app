const lambdafai = require('lambdafai');
const db = require('./lib/db');
const pwdb = require('./lib/pw-db');
const routes = require('./lib/routes');

lambdafai('beer', app => {
	// Define DynamoDB tables:
	app.table({
    'name': db.tableName,
    'fullSchema': db.fullSchema 
  });

  app.table({
    'name': pwdb.tableName,
    'fullSchema': pwdb.fullSchema
  });

	// Add middleware to authenticate the user.

	// Define Lambdas:
	app.lambda({ name: 'api', timeout: 60 })
  	.options('/beers', null, {'type': 'MOCK'})
  	.get('/beers', routes.getBeers)
    .post('/beers/:id', routes.postBeer)
    .get('/search', routes.getSearch)
    .post('/search', routes.postSearch);
});


/*
  AWS_PROFILE=personal node index.js create-resources dev
  AWS_PROFILE=personal node index.js invoke dev requests/beers-get.js
  AWS_PROFILE=personal node index.js deploy dev --lambda api
  AWS_PROFILE=personal node index.js promote dev prod

  AWS_PROFILE=personal node scripts/import-beers.js
*/