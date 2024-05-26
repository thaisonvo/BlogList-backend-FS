const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const api = supertest(app)

describe('When there is initially one user saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const password = await bcrypt.hash('qwerty', 10)

    const user = new User({
      username: 'FirstUser',
      name: 'First Person',
      passwordHash: password
    })

    await user.save()
  })

  test('creation succeeds with valid data', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'NewUser',
      name: 'New User',
      password: 'ytrewq'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()
    const usernames = usersAtEnd.map(user => user.username)

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    assert.ok(usernames.includes(newUser.username))
  })

  test('fails with status code 400 if username is not unique', async () => {
    const usersAtStart = await helper.usersInDb()

    const takenUsername = {
      username: 'FirstUser',
      password: 'secret'
    }

    const result = await api
      .post('/api/users')
      .send(takenUsername)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()
    
    assert.ok(result.body.error.includes('expected \'username\' to be unique'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status code 400 if username missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const missingUsername = {
      password: 'qwerty'
    }

    await api
      .post('/api/users')
      .send(missingUsername)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status code 400 if password missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const missingPassword = {
      username: 'onetwothree'
    }

    await api
      .post('/api/users')
      .send(missingPassword)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status code 400 if username is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const user = {
      password: 'qwerty'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status code 400 if password is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const user = {
      username: 'testing',
      password: 'n'
    }

    const result = await api
      .post('/api/users')
      .send(user)
      .expect(400)
    
    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    assert.ok(result.body.error.includes('password is required and must have at least three characters'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
