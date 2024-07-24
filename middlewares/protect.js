const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const AsyncHandler = require('./asyncAwait')

const Protected = AsyncHandler(async (req, res, next) => {
  let token;

  // Check if token is in cookies
  if (req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // verify token
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET)

    // asign user to req.user, so we can access user data in the route
    req.body.user = await User.findById(tokenDecoded.id)
    next()
  } catch (err) {
    next(new ErrorResponse('Not authorized to access this route', 401))
  }

})

module.exports = Protected