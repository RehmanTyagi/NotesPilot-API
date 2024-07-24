const path = require('path');
const fs = require('fs');
const AsyncHandler = require('../middlewares/asyncAwait');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// desc : get logged in user profile
// route : get /api/v1/user/profile
// access : private
exports.getProfile = AsyncHandler(async (req, res, next) => {
  const loggedUser = req.body.user.id
  const user = await User.findById(loggedUser)

  res.status(200).json({
    success: true,
    message: 'profile fetched successfully',
    data: user
  })
})

// desc : update logged in user profile
// route : PUT /api/v1/user/profile
// access : private
exports.updateProfile = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user.id
  const fieldsToBeUpdated = {
    name: req.body.username,
    email: req.body.email
  }

  // check if username or email is not provided
  if (req.body.username || req.body.email) {
    const user = await User.findByIdAndUpdate(loggedInUser, fieldsToBeUpdated, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      message: 'profile updated successfully',
      data: user
    })

  } else {
    return next(new ErrorResponse('Please provide username or email', 400))
  }

})

// desc : update logged in user profile
// route : POST /api/v1/user/profile/picture
// access : private
exports.updateProfilePicture = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user.id
  const profilePicture = req.files.profilePicture

  if (!profilePicture.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400))
  }
  if (profilePicture.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1024 / 1024}mb`, 400))
  }

  // create custom filename
  profilePicture.name = `photo_${loggedInUser}${path.parse(profilePicture.name).ext}`
  // move file to uploads folder
  profilePicture.mv(`${process.env.PROFILE_PICTURE_UPLOAD_PATH}/${profilePicture.name}`, async err => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse('Problem with file upload', 500))
    }

    await User.findByIdAndUpdate(loggedInUser, { profilePicture: profilePicture.name })
    res.status(200).json({
      success: true,
      message: 'profile picture uploaded successfully',
      data: profilePicture.name
    })
  })

})

// desc : delete logged in user profile picture
// route : DELETE /api/v1/user/profile/picture
//access : private
exports.deleteProfilePicture = AsyncHandler(async (req, res, next) => {
  const loggedInUser = req.body.user.id
  const user = await User.findById(loggedInUser)

  if (!user) {
    return next(new ErrorResponse('unauthorized access', 401))
  }
  if (user.profilePicture === process.env.DEFAULT_PROFILE_PICTURE) {
    return next(new ErrorResponse('You have not uploaded a profile picture', 400))
  }

  profilePicturePath = `${process.env.PROFILE_PICTURE_UPLOAD_PATH}/${user.profilePicture}`
  // remove photo from uploads folder
  fs.unlink(profilePicturePath, err => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse('Problem with file upload', 500))
    }
  })

  await User.findByIdAndUpdate(loggedInUser, { profilePicture: process.env.DEFAULT_PROFILE_PICTURE })

  res.status(200).json({
    success: true,
    message: 'profile picture deleted successfully',
    data: {}
  })
})