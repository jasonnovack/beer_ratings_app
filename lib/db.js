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

const batchGet = async (req, keys) => {
  const table = getTable(req);
  const uniqueKeys = Array.from(new Set(keys));
  const keyObjs = uniqueKeys.map(key => {
    return {
      'id': key
    }
  });
  return Q.ninvoke(table, 'batchGet', {
    'Keys': keyObjs,
  });
};

const postBeer = async (req) => {
  const table = getTable(req);
  let item = req.body || {};
  item.b = 'b';
  let params = {
    'Item': item,
  };
  return Q.ninvoke(table, 'put', params);
};

const filterByScore = async (req, score) => {
  let results = [];
  const table = getTable(req);
  
  const getPage = async (startKey) => {
    let params = {
      'Key': {
        'score': score.toString()
      },
      'ScanIndexForward': false,
      'IndexName': 'ScoreCreatedAtIndex',
      'FullResult': true
    };
    if (startKey) {
      params.ExclusiveStartKey = startKey;
    }
    let page = await Q.ninvoke(table, 'list', params);
    results = results.concat(page.Items);
    if (page.LastEvaluatedKey) {
      return getPage(page.LastEvaluatedKey);
    } else {
      return;
    }
  };
  await getPage();
  return results;
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
      AttributeName: 'score',
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
      IndexName: 'ScoreCreatedAtIndex',
      KeySchema: [ 
        {
          AttributeName: 'score',
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
  'listByCreatedAt': listByCreatedAt,
  'batchGet': batchGet,
  'postBeer': postBeer,
  'filterByScore': filterByScore
};