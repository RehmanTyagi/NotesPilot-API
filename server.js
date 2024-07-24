const path = require('path')  // path module
const express = require('express') // express framework
const dotenv = require('dotenv') // environment variables
const morgan = require('morgan') // logger middleware
const colors = require('colors') // colors for console logs
const connectDB = require('./config/db') // connect to database
const ErrorHandler = require('./middlewares/error') // error handler middleware
const CookieParser = require('cookie-parser') // parse cookies
const helmet = require('helmet') // set security headers
const hpp = require('hpp') // prevent http param pollution
const limiter = require('express-rate-limit') // rate limiter
const mongoSanitize = require('express-mongo-sanitize') // prevent nosql injection
const fileUpload = require('express-fileupload') // file upload middleware

// routes
const notes = require('./routes/notes') // notes routes
const auth = require('./routes/auth')   // auth routes
const profile = require('./routes/profile') // user profile routes
const backup = require('./routes/backup') // backup routes

// configs
dotenv.config({ path: './config/config.env' })
const PORT = process.env.PORT || 8000

// connect to database
connectDB()

// Server
const app = express()

// body parser
app.use(express.json());

// rate limiter
const limiterOptions = {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}
app.use(limiter(limiterOptions))

// cookie parser
app.use(CookieParser())

// helmet
app.use(helmet())

// sanitize data
app.use(mongoSanitize())

// prevent http param pollution
app.use(hpp())

// file upload
app.use(fileUpload())

app.use(express.static(path.join(__dirname, 'public')))

// logger Middleware to log routes
app.use(morgan('dev'))

// handle mounted routes
app.use('/api/v1/backup/notes', backup)
app.use('/api/v1/notes', notes)
app.use('/api/v1/auth', auth)
app.use('/api/v1/user', profile)

// error handler
app.use(ErrorHandler)

// server listening
const server = app.listen(PORT, () => console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT} `.green.bold))

// handles unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error occurred: ${err.message}`.red.bold)
    server.close(() => process.exit(1))
})