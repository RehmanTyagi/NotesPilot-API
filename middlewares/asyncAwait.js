const AsyncHandler = fn => (reg, res, next) => {
  Promise.resolve(fn(reg, res, next)).catch(next)
}

module.exports = AsyncHandler