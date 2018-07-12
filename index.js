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
  	.options('/beer', null, {'type': 'MOCK'})
  	.get('/beer', (req, res) => {
      res.send('beer');
    });

});


/*
  AWS_PROFILE=personal node index.js create-resources dev
  AWS_PROFILE=personal node index.js invoke dev requests/get.js
  AWS_PROFILE=personal node index.js deploy dev --lambda api
  AWS_PROFILE=personal node index.js promote dev prod
*/