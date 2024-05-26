const logger = require('./logger')
const morgan = require('morgan')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'MongoServerError') {
    return response.status(400).send({ error: 'expected \'username\' to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).send({ error: 'token expired' })
  }

  next(error)
}

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization) {
    return response.status(401).send({ error: 'authorization header missing' })
  }
  if (authorization && authorization.startsWith('Bearer ')) {
    const tokenString = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(tokenString, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).send({ error: 'invalid token' })
    }
    
    request.token = decodedToken
    request.user = await User.findById(decodedToken.id)
  } else {
    return response.status(401).send({ error: 'invalid token' })
  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  userExtractor
}