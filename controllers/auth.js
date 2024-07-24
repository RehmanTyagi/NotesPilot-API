const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler = require('../middlewares/asyncAwait');
const SendTokenResponse = require('../utils/sendTokenResponse');
const SendEmail = require('../utils/sendEmail');
const ForgotPasswordTemplate = require('../utils/forgotPasswordTemplate');
const WelcomeEmailTemplate = require('../utils/WelcomeEmailTemplate');
const crypto = require('crypto');

// desc : Register a new user
// route : POST /api/v1/auth/register
// access : Public
exports.register = AsyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body

  const user = await User.create({
    name: username,
    email,
    password,
    role: 'user',
    profilePicture: process.env.DEFAULT_PROFILE_PICTURE
  })

  const confirmEmailToken = user.getConfirmEmailToken()
  if (!confirmEmailToken) {
    return next(new ErrorResponse('Error occured while generating email confirmation token', 500))
  }

  // save user without validation
  await user.save({ validateBeforeSave: false })

  // token url
  const confirmEmailURL = `${req.protocol}://${req.get('host')}/api/v1/auth/confirmemail?token=${confirmEmailToken}`

  // send email to user email
  SendEmail({
    email: user.email,
    subject: 'Email confirmation token from NotesPilot inc',
    html: WelcomeEmailTemplate({ user, password, company: 'NotesPilot inc', confirmEmailURL })
  })

  // delete user if email not confirmed within 10 mins
  setTimeout(async () => {
    try {
      const user = await User.findOne({ email })

      if (user.isEmailConfirmed === false) {
        await User.deleteOne({ email: user.email })
        console.log('token expired, registration/signup request deleted!', user.email)
      } else if (user.isEmailConfirmed === true) {
        console.log('user email confirmed successfully!', user.email)
      }
    } catch (err) {
      next(err)
    }
  }, 600000) // 10 mins

  res.status(201).json({
    success: true,
    message: 'User registered successfully, please check your email to confirm!',
    data: {}
  })

})

// desc : confirm email to register user
// route : GET /api/v1/auth/confirmemail?token=hash
// access : public
exports.confirmEmail = AsyncHandler(async (req, res, next) => {

  const token = req.query.token
  if (!token) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  const decodedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    emailConfirmToken: decodedToken
  })

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  user.isEmailConfirmed = true;
  user.emailConfirmToken = undefined;
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    data: { message: 'Email confirmed successfully!' }
  })
})

// desc : login user
// route : POST /api/v1/auth/login
// access : public
exports.login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  if (!email, !password) {
    return next(new ErrorResponse('please provide email and password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }
  if (user.isEmailConfirmed === false) {
    return next(new ErrorResponse('user not authorized!', 401))
  }

  const isPasswordMatch = await user.matchPasswords(password)

  if (!isPasswordMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  SendTokenResponse(user, 200, res)
})

// desc : logout user
// route : POST /api/v1/auth/logout
// access : private
exports.logout = AsyncHandler(async (req, res, next) => {
  res.status(200).clearCookie('token').json({ success: true, message: 'logout successfully', data: {} })
})

// desc : forgot password
// route : POST /api/v1/auth/forgotpassword
// access : public
exports.forgotPassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user || user.isEmailConfirmed === false) {
    return next(new ErrorResponse(`no user found with ${req.body.email}, try right one!`, 404))
  }

  const resetToken = user.getForgotPasswordToken()
  await user.save({ validateBeforeSave: false })

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
  // const message = `You are receiving this email because you (or someone else) has requested the reset of a password. visit this link to forget password: \n\n ${resetURL}`
  const html = ForgotPasswordTemplate({ username: user.name, company: 'NotesPilot inc', resetURL })

  try {
    SendEmail({
      email: user.email,
      subject: 'Password reset token from NotesPilot inc',
      html: html
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    next(new ErrorResponse('Email could not be sent', 500))
  }

  res.status(200).json({
    success: true,
    message: 'forget password token sent successfully!, please check your email',
    data: {}
  })

})

// desc : reset password
// route : PUT /api/v1/auth/resetpassword/:token
// access : public
exports.resetPassword = AsyncHandler(async (req, res, next) => {
  const newPassword = req.body.newPassword
  const confirmPassword = req.body.confirmPassword
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  // if no user found with the token
  if (!user || user.isEmailConfirmed === false) {
    return next(new ErrorResponse('The token is invalid', 400))
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorResponse('Passwords do not match', 400))
  }

  // set new password
  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  SendTokenResponse(user, 200, res)
})