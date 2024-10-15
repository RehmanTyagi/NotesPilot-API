const mongoose = require('mongoose');
const BackupNote = require('./BackupNote');

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'description cannot be more than 500 characters'],
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['General', 'Work', 'Personal', 'Archive', 'Study'],
      required: [true, 'Please provide a category for this note.'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-findOneAndDelete middleware to access the document before deletion
NoteSchema.pre('findOneAndDelete', async function (next) {
  console.log('pre findOneAndDelete middleware called');
  const doc = await this.model.findOne(this.getQuery());

  // construct the object to store in backup before it deleted
  const deletedNote = {
    _id: doc._id,
    user: doc.user,
    title: doc.title,
    description: doc.description,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  // If the document is deleted, create a backup of the document into the BackupNote collection
  await BackupNote.create(deletedNote);

  // call next middleware
  next();
});

module.exports = mongoose.model('Note', NoteSchema);
