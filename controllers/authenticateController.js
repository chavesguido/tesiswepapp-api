// Cliente de Redis
const redisClient = require('./loginController').redisClient;

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if(!authorization)
    return res.status(401).json();
  return redisClient.get(authorization, (err, reply) => {
    if(err || !reply)
      return res.status(401).json();
    return next;
  });
}

module.exports = {
  requireAuth
}
