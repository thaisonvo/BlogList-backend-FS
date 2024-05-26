const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')


describe('When there are blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs have the attribute \'id\'', async () => {
    const response = await api.get('/api/blogs')

    assert.ok(response.body.every(blog => blog.hasOwnProperty('id')))
  })

  describe('deletion of a specific blog', () => {
    test('succeeds with an ID of the blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
      
      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)

      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })

  describe('addition of a new blog', () => {
    test('fails with the status code 400 if \'title\' property is missing', async () => {
      const blog = { author: 'asd', url: 'dsa', likes: 0 }
      await api
        .post('/api/blogs')
        .send(blog)
        .expect(400)
    })

    test('fails with the status code 400 if \'url\' property is missing', async () => {
      const blog = { title: 'Blog with no URL', author: 'Author with no URL', likes: 0 }
      await api
        .post('/api/blogs')
        .send(blog)
        .expect(400)
    })

    test('succeeds with \'likes\' property set to 0, if it is missing', async () => {
      const blog = {
        title: 'This post has no likes',
        author: 'Anonymous',
        url: 'No URL'
      }

      await api
        .post('/api/blogs')
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const allBlogs = await helper.blogsInDb()
      const addedBlog = allBlogs.find(b => b.title === blog.title && b.url === blog.url)

      assert.strictEqual(addedBlog.likes, 0)
    })

    test('succeeds with valid data', async () => {
      const singleBlog = helper.blogObject

      await api
        .post('/api/blogs')
        .send(singleBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const response = await api.get('/api/blogs')
      const contents = response.body.map(b => b.title)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(contents.includes('This is for testing'))
    })
  })

  describe('updating a specific blog', () => {
    test('succeeds with valid data', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToUpdate = { ...initialBlogs[0], likes: 3000 }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const afterBlogs = await helper.blogsInDb()
      const updatedBlog = afterBlogs.find(b => b.id === blogToUpdate.id)
      
      assert.strictEqual(updatedBlog.likes, 3000)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
