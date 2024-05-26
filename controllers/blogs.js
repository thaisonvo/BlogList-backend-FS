const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.status(200).json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes=0 } = request.body
  const user = request.user
  
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  await savedBlog.populate('user', { username: 1, name: 1 })

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const { id } = request.params
  const token = request.token
  const user = request.user
  const blog = await Blog.findById(id)

  if (!blog) {
    return response.status(404).send({ error: 'blog not found' })
  }

  if (blog.user.toString() !== token.id.toString()) {
    return response.status(401).send({ error: 'blog can only be deleted by its creator' })
  }

  user.blogs = user.blogs.filter(blog => blog.toString() !== id)
  await user.save()

  await Blog.findByIdAndDelete(id)

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, user } = request.body

  const updatedObject = await Blog
    .findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes, user },
      { new: true, runValidators: true, context: 'query' }
    )
    .populate('user', { username: 1, name: 1 })

    response.status(201).json(updatedObject)
})

module.exports = blogsRouter