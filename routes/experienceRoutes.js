const express = require('express')
const router = express.Router()
const experienceController = require('../controllers/experienceController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(experienceController.getAllExperiences)
    .post(experienceController.createNewExperience)

module.exports = router