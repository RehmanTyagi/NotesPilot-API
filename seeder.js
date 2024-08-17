const fs = require('fs');
const mongoose = require('mongoose');
const Note = require('./models/Note');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({ path: './config/config.env' });

// Connect to DB
mongoose.connect(process.env.DB_CONNECTIONSTRING);

// notes data
const NOTES = JSON.parse(
  fs.readFileSync(`${__dirname}/data/notes.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Note.create(NOTES);
    console.log('Data imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};
const destroyData = async () => {
  try {
    await Note.deleteMany();
    console.log('Data destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};

if (process.argv[2] === 'import') {
  importData();
} else if (process.argv[2] === 'destroy') {
  destroyData();
} else {
  'Invalid command'.red.inverse;
}
