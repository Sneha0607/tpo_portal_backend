const express = require('express')
const router = express.Router()
const recruiterController = require('../controllers/recruiterController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(recruiterController.getAllRecruiters)
    .post(recruiterController.createNewRecruiter)

router.route('/:id')
    .get(recruiterController.getRecruiter)

module.exports = router