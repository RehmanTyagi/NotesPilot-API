const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: process.env.DEFAULT_PROFILE_PICTURE,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
      minlength: 6,
    },
    role: {
      type: String,
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailConfirmToken: String,
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedJWTToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};

UserSchema.methods.getForgotPasswordToken = function () {
  // generating token
  const forgotToken = crypto.randomBytes(20).toString('hex');

  // hashing token and setting to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');

  // setting expire time
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return forgotToken;
};

UserSchema.methods.getConfirmEmailToken = function () {
  // generating token
  const confirmToken = crypto.randomBytes(20).toString('hex');

  // hashing token and setting to resetPasswordToken field
  this.emailConfirmToken = crypto
    .createHash('sha256')
    .update(confirmToken)
    .digest('hex');

  return confirmToken;
};

module.exports = mongoose.model('User', UserSchema);
