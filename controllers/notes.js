const Note = require('../models/Note');
const AsyncHandler = require('../middlewares/asyncAwait');
const ErrorResponse = require('../utils/errorResponse');

//@desc      Get all Notes
//@route     GET /api/v1/notes
//@access    private
exports.getNotes = AsyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

//@desc      Get note by id
//@route     GET /api/v1/notes/:id
//@access    private
exports.getNote = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user._id;
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }
  if (note.user.toString() !== loggedInUser.toString()) {
    return next(
      new ErrorResponse(`User not authorized to access this note`, 401)
    );
  }

  res.status(200).json({
    success: true,
    message: `note ${note.title} found successfully`,
    data: note,
  });
});

//@desc      create new Note
//@route     POST /api/v1/notes
//@access    private
exports.createNote = AsyncHandler(async (req, res, next) => {
  req.body.user = req.body.user._id;
  const note = await Note.create(req.body);
  res.status(201).json({
    success: true,
    message: `note ${note.title} created successfully`,
    data: note,
  });
});

//@desc      updated note
//@route     PUT /api/v1/notes/:id
//@access    private
exports.updateNote = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user;
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }
  // if user is not owner of the note simply return error
  if (note.user.toString() !== loggedInUser.id.toString()) {
    return next(
      new ErrorResponse(
        `${loggedInUser.name} not authorized to update this note`,
        401
      )
    );
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'note updated successfully',
    data: updatedNote,
  });
});

//@desc      delete note
//@route     DELETE /api/v1/notes/:id
//@access    private
exports.deleteNote = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user;
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }
  // if user is not owner of the note simply return error
  if (note.user.toString() !== loggedInUser.id.toString()) {
    return next(
      new ErrorResponse(
        `${loggedInUser.name} not authorized to delete this note`,
        401
      )
    );
  }

  await Note.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({ success: true, message: 'note deleted successfully', data: {} });
});
