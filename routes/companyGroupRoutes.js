const express = require('express')
const router = express.Router()
const companyGroupController = require('../controllers/companyGroupController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/').get()

module.exports = router