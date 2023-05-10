const express = require('express')
const router = express.Router()
const statisticsController = require('../controllers/statisticsController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/').get()

module.exports = router