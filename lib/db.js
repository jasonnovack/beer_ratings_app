const lambdafai = require('lambdafai');
const db = lambdafai.database;
const Q = require('q');

const tableName = 'Beer';

const getTable = (req) => {
  return db.table(req.tableName(tableName));
};

const listByCreatedAt = async (req, limit) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'b': 'b'
    },
    'ScanIndexForward': false,
    'IndexName': 'BCreatedAtIndex'
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
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'createdAt',
      AttributeType: 'N'
    },
    {
      AttributeName: 'nameNormalized',
      AttributeType: 'S'
    },
    {
      AttributeName: 'rating',
      AttributeType: 'N'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id', 
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
      IndexName: 'BCreatedAtIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'createdAt',
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
    },
    {
      IndexName: 'BNameNormalizedIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'nameNormalized',
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
    },
    {
      IndexName: 'BRatingIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'rating',
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
  'listByCreatedAt': listByCreatedAt
};