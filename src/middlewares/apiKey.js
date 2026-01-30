module.exports = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    return res.status(401).json({
      message: 'API_KEY missing'
    });
  }

  if (apiKey !== process.env.API_KEY_BACKEND) {
    return res.status(403).json({
      message: 'Invalid API_KEY'
    });
  }

  next();
};
