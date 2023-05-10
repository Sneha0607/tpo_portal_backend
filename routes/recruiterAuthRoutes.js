const express = require('express')
const router = express.Router()
const recruiterAuthController = require('../controllers/recruiterAuthController')

router.route('/')
    .post(recruiterAuthController.login)

router.route('/logout')
    .post(recruiterAuthController.logout)

module.exports = router