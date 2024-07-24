const express = require('express')
const router = express.Router()

const { getNote, getNotes, createNote, deleteNote, updateNote } = require('../controllers/notes')
const Note = require('../models/Note')

// filter advancedResults middleware
const advancedFilteredResults = require('../middlewares/advancedResult')
// protect route middleware
const Protected = require('../middlewares/protect')

// uses protected middleware in all routes
router.use(Protected)

router.route('/').get(advancedFilteredResults(Note), getNotes).post(createNote)
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote)


module.exports = router