const express = require('express');
const router = express.Router();

const BackupNote = require('../models/BackupNote');
const { getAllBackupNotes, restoreAllNotes, restoreSingleNote, deleteAllBackupNotes } = require('../controllers/backup')

const Protected = require('../middlewares/protect');
const advancedFilteredResults = require('../middlewares/advancedResult');

router.use(Protected);

router.route('/').get(advancedFilteredResults(BackupNote), getAllBackupNotes).put(restoreAllNotes).delete(deleteAllBackupNotes);
router.route('/:id').put(restoreSingleNote);

module.exports = router;