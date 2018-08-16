const lambdafai = require('lambdafai');
const db = lambdafai.database;
const Q = require('q');

const tableName = 'Passwords';

const getTable = (req) => {
  return db.table(req.tableName(tableName));
};

const getPassword = (req) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'password': req.body.password
    }
  };
  return Q.ninvoke(table, 'get', params);
};

const fullSchema = {
  AttributeDefinitions: [
    {
      AttributeName: 'password',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'password', 
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: { 
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: tableName,
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  },
  SSESpecification: {
    Enabled: true
  }
};

module.exports = {
  'tableName': tableName,
  'fullSchema': fullSchema,
  'getPassword': getPassword
};