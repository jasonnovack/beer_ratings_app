const db = require('./db');

const getBeers = async (req, res) => {
	try {
    let response = await db.listByCreatedAt(req);
    res.send(response);  
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
}

module.exports = {
  'getBeers': getBeers
}