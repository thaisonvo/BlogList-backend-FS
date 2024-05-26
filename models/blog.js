const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: { type: String, required: [true, 'Missing the property \'title\''] },
  author: String,
  url: { type: String, required: [true, 'Missing the property \'url\''] },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)
