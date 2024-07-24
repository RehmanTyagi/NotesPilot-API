const AsyncHandler = require('../middlewares/asyncAwait');
const ErrorResponse = require('../utils/errorResponse');
const BackupNote = require('../models/BackupNote');
const Note = require('../models/Note');

// desc : Get all backup notes
// route : GET /api/v1/backup/notes
// access : Private
exports.getAllBackupNotes = AsyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

// desc : Restore all notes
// route : PUT /api/v1/backup/notes
// access : Private
exports.restoreAllNotes = AsyncHandler(async (req, res, next) => {
  const user = req.body.user.id;

  const backup = await BackupNote.find({ user });

  if (backup.length === 0) {
    return next(new ErrorResponse('No notes found to restore', 404));
  }

  const restoredNotes = await Note.insertMany(backup);
  if (!restoredNotes) {
    return next(new ErrorResponse('Error in restoring notes', 500));
  }

  await BackupNote.deleteMany({ user });

  res.status(200).json({ success: true, message: 'Notes restored successfully', data: restoredNotes });

})

// desc : Restore a single note
// route : PUT /api/v1/backup/notes/:id
// access : Private
exports.restoreSingleNote = AsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const note = await BackupNote.findOne({ _id: id });

  if (!note) {
    return next(new ErrorResponse('No note found to restore or invalid Id', 404));
  }

  let restoredNote = {
    title: note.title,
    description: note.description,
    content: note.content,
    user: note.user,
  }

  restoredNote = await Note.create(restoredNote);

  if (!restoredNote) {
    return next(new ErrorResponse('Error in restoring note', 500));
  }

  await BackupNote.deleteOne({ _id: id });

  res.status(200).json({ success: true, message: 'Note restored successfully', data: restoredNote });

})

// desc : Delete all backup notes
// route : DELETE /api/v1/backup/notes
// access : Private
exports.deleteAllBackupNotes = AsyncHandler(async (req, res, next) => {
  // Get user id from request body
  const user = req.body.user.id;

  // Check if backup notes exist
  const backup = await BackupNote.find({ user });

  // If no backup notes found return error
  if (backup.length === 0) {
    return next(new ErrorResponse('No notes found to delete permanently', 404));
  }

  // Delete all backup notes
  await BackupNote.deleteMany({ user });

  res.status(200).json({ success: true, message: 'Backup notes deleted successfully', data: {} });
})