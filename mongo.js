const mongoose = require('mongoose')
const Blog = require('./models/blog')
require('dotenv').config()
const url = process.env.TEST_MONGODB_URI

const argLength = process.argv.length

mongoose.connect(url)

if (argLength < 5) {
  console.log('Fetching all blogs...')
  Blog.find({})
    .then(blogs => {
      blogs.forEach(blog => {
        console.log(blog)
      })
      mongoose.connection.close()
    })
} else {
  console.log('Adding a new blog...')
  const blog = new Blog({
    title: process.argv[2],
    author: process.argv[3],
    url: process.argv[4],
    likes: process.argv[5]
  })

  blog.save()
    .then(returnedBlog => {
      console.log(returnedBlog)
      mongoose.connection.close()
    })
}