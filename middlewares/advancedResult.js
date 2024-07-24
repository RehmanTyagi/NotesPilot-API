const advancedResult = (model, populate) => async (req, res, next) => {
  const loggedInUser = req.body.user._id

  let query = model.find({ user: loggedInUser })

  // search query
  if (req.query.search) {
    const search = req.query.search.split(',').join(' ')
    query = query.find({ title: { $regex: search, $options: 'i' } })
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }
  // Pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  query = query.skip(startIndex).limit(limit)

  // Populating
  if (populate) {
    query = query.populate(populate)
  }

  // Executing query
  const results = await query

  // Pagination result
  const pagination = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.advancedResult = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }
  next()

}

module.exports = advancedResult