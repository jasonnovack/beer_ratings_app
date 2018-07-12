const lambdafai = require('lambdafai');
const db = require('./lib/db');
const errors = lambdafai.errors;

lambdafai('beer', app => {
	// Define DynamoDB tables:
	app.table({
    'name': db.tableName,
    'fullSchema': db.fullSchema 
  });

	// Add middleware to authenticate the user.

	// Define Lambdas:
	app.lambda({ name: 'api', timeout: 60 })
  	.options('/beers', null, {'type': 'MOCK'})
  	.get('/beers', async (req, res) => {
      try {
        let response = await db.listByCreatedAt(req);
        res.send(response);  
      } catch (e) {
        console.error(e);
        res.done(e, null);
      } 
    });

});


/*
  AWS_PROFILE=personal node index.js create-resources dev
  AWS_PROFILE=personal node index.js invoke dev requests/beers-get.js
  AWS_PROFILE=personal node index.js deploy dev --lambda api
  AWS_PROFILE=personal node index.js promote dev prod
*/