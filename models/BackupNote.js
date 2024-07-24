const mongoose = require('mongoose')

const BackupNoteSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('BackupNote', BackupNoteSchema)