const db = require('./db');
const tallydb = require('./tallies-db');

const updateTallies = async (req, res) => {
  let scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (let num of scores) {
    try {
      let tally = await db.filterByScore(req, num);
      let response = await tallydb.putTally(req, num, tally.length || 0);
    } catch (e) {
      console.error(e);
      console.log(e, null);
    }
  }
};

module.exports = {
  'updateTallies': updateTallies
};