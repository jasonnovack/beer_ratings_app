const lambdafai = require('lambdafai');
const db = require('./lib/db');
const pwdb = require('./lib/pw-db');
const tallydb = require('./lib/tallies-db');
const routes = require('./lib/routes');
const crons = require('./lib/crons');

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

  app.table({
    'name': tallydb.tableName,
    'fullSchema': tallydb.fullSchema
  });

	// Add middleware to authenticate the user.

	// Define Lambdas:
	app.lambda({ name: 'api', timeout: 60 })
  	.options('/beers', null, {'type': 'MOCK'})
  	.get('/beers', routes.getBeers)
    .post('/beers', routes.postBeer)
    .get('/search', routes.getSearch)
    .post('/search', routes.postSearch)
    .post('/tallies', routes.postTally);

  app.lambda({ name: 'crons', timeout: 300, ram: 512})
    .scheduledEvent('/updateTallies', crons.updateTallies);
});


/*
  AWS_PROFILE=personal node index.js create-resources dev
  AWS_PROFILE=personal node index.js invoke dev requests/beers-get.js
  AWS_PROFILE=personal node index.js deploy dev --lambda api
  AWS_PROFILE=personal node index.js promote dev prod

  AWS_PROFILE=personal node scripts/import-beers.js
*/