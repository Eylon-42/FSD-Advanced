const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../store/tokenStore');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  if (isTokenBlacklisted(token)) {
    return res.status(401).send('Token is invalidated');
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send('Access token expired');
      } else {
        return res.sendStatus(403);
      }
    }
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;