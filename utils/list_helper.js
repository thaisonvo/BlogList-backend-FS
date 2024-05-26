const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }

  let total = 0
  blogs.forEach(blog => total += blog.likes)

  return total
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  let mostLiked = blogs[0]
  blogs.forEach(blog => {
    if (blog.likes > mostLiked.likes) {
      mostLiked = blog
    }
  })

  return mostLiked
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}