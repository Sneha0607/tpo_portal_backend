const express = require("express");
const router = express.Router();
const companyFormController = require("../controllers/companyFormController");
const verifyJWT = require("../middleware/verifyJWT");

// router.use(verifyJWT);

router
  .route("/")
  .get(companyFormController.getAllCompanyForms)
  .post(companyFormController.createNewCompanyForm)
  .patch(companyFormController.updateCompanyForm);

router.route("/register").patch(companyFormController.registerStudent)
router.route("/registered/:id").get(companyFormController.getRegistered)
router.route("/shortlist").patch(companyFormController.shortlistStudent)
router.route("/shortlisted/:id").get(companyFormController.getShortlisted)
router.route("/place").patch(companyFormController.placeStudent)
router.route("/placed/:id").get(companyFormController.getPlaced)

module.exports = router;
