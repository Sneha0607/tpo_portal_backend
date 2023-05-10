const express = require('express')
const router = express.Router()
const studentController = require('../controllers/studentController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .patch(studentController.updateStudent)

module.exports = router