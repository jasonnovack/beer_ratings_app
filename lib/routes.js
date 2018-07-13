const db = require('./db');

const getBeers = async (req, res) => {
	try {
    let response = await db.listByCreatedAt(req);
    res.send(response);  
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

const postBeer = async (req, res) => {
  let item = {
    'createdAt': req.body.createdAt,
    'name': req.body.name,
    'score': req.body.score,
    'comment': req.body.comment,
    'id': req.body.id,
    'brewer': req.body.brewer,
    'brewerType': req.body.brewerType,
    'city': req.body.city,
    'state': req.body.state,
    'country': req.body.country,
    'style': req.body.style,
    'styleParent': req.body.styleParent
  }
  try {
    let response = await db.postBeer(req);
    res.send(response);
  } catch (e) {
    console.error(e);
    res.done(e, null);
  }
};

module.exports = {
  'getBeers': getBeers,
  'postBeer': postBeer
}