const User = require('../models/User')
const bcrypt = require('bcrypt')

// @desc Update a user
// @route PATCH /users
// @access Private
const updateStudent = async (req, res) => {
    const { id, email, linkedin, skype, residentialStatus, resume, photo } = req.body

    // Confirm data 
    if (!id || !email || !linkedin || !skype || !residentialStatus || !resume || !photo) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // // Check for duplicate 
    // const duplicate = await User.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // // Allow updates to the original user 
    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate username' })
    // }

    user.email = email
    user.linkedin = linkedin
    user.skype = skype
    user.residentialStatus = residentialStatus
    user.resume = resume
    user.photo = photo
    user.profileStatus = 'Verified'

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.name} updated` })
}


module.exports = {
    updateStudent
}