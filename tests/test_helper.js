const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const initialBlogs = [
  {
    title: 'Blog post UNO',
    author: 'Thai Son Vo',
    url: 'No URL',
    likes: 123
  },
  {
    title: 'I love cats',
    author: 'Veera Takanen',
    url: 'No URL',
    likes: 123123123
  },
  {
    title: 'Asynchronous functions are nifty',
    author: 'Thaison Vo',
    url: 'something.com',
    likes: 33
  }
]

const blogObject = {
  title: 'This is for testing',
  author: 'Thaison Vo',
  url: 'No URL',
  likes: 123
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const user = await User.find({})
  return user.map(u => u.toJSON())
}

const getToken = async () => {
  const hashedPassword = bcrypt.hash('qwerty', 10)

  const user = new User({
    username: 'TestUser',
    name: 'Test User',
    password: hashedPassword
  })

  const savedUser = await user.save()

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id
  }

  return jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })
}

module.exports = {
  initialBlogs,
  blogObject,
  blogsInDb,
  usersInDb,
  getToken
}