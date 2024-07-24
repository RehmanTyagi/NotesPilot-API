const mongoose = require('mongoose')

const connectDB = async () => {
    const connect = await mongoose.connect(process.env.DB_CONNECTIONSTRING)
    console.log(`db connected with host ${connect.connection.host.white.inverse}`.blue)
}

module.exports = connectDB