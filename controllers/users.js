const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!password || password.length < 3) {
    return response.status(400).send({ error: 'password is required and must have at least three characters' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({ username, name, passwordHash })
  const returnedUser = await user.save()
  response.status(201).json(returnedUser)
})

module.exports = usersRouter