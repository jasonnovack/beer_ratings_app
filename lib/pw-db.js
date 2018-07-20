const lambdafai = require('lambdafai');
const db = lambdafai.database;
const Q = require('q');

const tableName = 'Passwords';

const getTable = (req) => {
  return db.table(req.tableName(tableName));
};

const listPasswords = (req, limit) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'b': 'b'
    },
    'ScanIndexForward': false,
    'IndexName': 'BPasswordIndex'
  };
  if (limit) {
    params.Limit = limit;
  }
  return Q.ninvoke(table, 'list', params);
};

const fullSchema = {
  AttributeDefinitions: [
    {
      AttributeName: 'b',
      AttributeType: 'S'
    },
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
  GlobalSecondaryIndexes: [
    {
      IndexName: 'BPasswordIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'password',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ],
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
  'listPasswords': listPasswords
};