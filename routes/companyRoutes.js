const express = require('express')
const router = express.Router()
const companyController = require('../controllers/companyController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(companyController.getAllCompanies)
    .post(companyController.createNewCompany)

module.exports = router