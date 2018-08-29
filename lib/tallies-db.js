const lambdafai = require('lambdafai');
const db = lambdafai.database;
const Q = require('q');

const tableName = 'Tallies';

const getTable = (req) => {
  return db.table(req.tableName(tableName));
};

const listTallies = async (req) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'b': 'b'
    },
    'ScanIndexForward': false,
    'IndexName': 'BScoreIndex'
  };
  return Q.ninvoke(table, 'list', params);
};

const putTally = async (req, score, count) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'score': score
    },
    'Update': {
      'b': 'b',
      'count': count
    },
    ShouldInsert: true
  };
  return Q.ninvoke(table, 'patch', params);
};

const increment = async (req, score) => {
  const table = getTable(req);
  let params = {
    'Key': {
      'score': score
    },
    'Amount': {
      'count': 1
    }
  };
  return Q.ninvoke(table, 'increment', params);
};

const fullSchema = {
  AttributeDefinitions: [
    {
      AttributeName: 'b',
      AttributeType: 'S'
    },
    {
      AttributeName: 'score',
      AttributeType: 'N'
    },
    {
      AttributeName: 'count',
      AttributeType: 'N'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'score', 
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
      IndexName: 'BScoreIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'score',
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
      IndexName: 'BCountIndex',
      KeySchema: [ 
        {
          AttributeName: 'b',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'count',
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
  'listTallies': listTallies,
  'putTally': putTally,
  'increment': increment
};