const advancedResult = (model, populate) => async (req, res, next) => {
  const loggedInUser = req.body.user._id;

  let query = model.find({ user: loggedInUser });

  // search query
  if (req.query.search) {
    const search = req.query.search.split(',').join(' ');
    query = query.find({ title: { $regex: search, $options: 'i' } });
  }

  // Date filter
  const patterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    // Add more patterns as needed
  ];
  const isValidDate = (date) => {
    return patterns.some((pattern) => pattern.test(date));
  };

  // Filter
  if (isValidDate(req.query.filter)) {
    const date = req.query.filter;
    const parts = date.split('/');
    const formatedDate = new Date(parts[2], parts[1] - 1, parts[0]);
    query = query.find({
      createdAt: {
        $gte: new Date(formatedDate.setHours(0, 0, 0, 0)), // start of the day
        $lt: new Date(formatedDate.setHours(23, 59, 59, 999)), // end of the day
      },
    });
  } else if (req.query.filter) {
    query = query.find({
      category: req.query.filter,
    });
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  // Populating
  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResult = {
    success: true,
    message: 'fetched successfully',
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResult;
