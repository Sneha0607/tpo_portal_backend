const Recruiter = require("../models/Recruiter")
const Company = require("../models/Company")
var generator = require('generate-password');
const bcrypt = require("bcrypt")

const getAllRecruiters = async (req, res) => {
    // Get all recruiters
    const recruiters = await Recruiter.find().sort({name: 1}).lean()

    // If no recruiters
    if (!recruiters?.length) {
        return res.status(400).json({ message: 'No recruiters found' })
    }

    // Add company name to each recruiter before sending the response
    const recruitersWithCompany = await Promise.all(recruiters.map(async (recruiter) => {
        const company = await Company.findById(recruiter.companyID).lean().exec()
        return { ...recruiter, company: company.name}
    }))

    res.json(recruitersWithCompany)

}

// Create new recruiter
// POST /recruiter
const createNewRecruiter = async (req, res) => {
    const { companyID, name, gender, email } = req.body;

    // Confirm data 
    if(!companyID || !name || !gender || !email) {
        return res.status(400).json({message: "All fields are required"})
    }

    // Check for duplicate email
    const duplicate = await Recruiter.findOne({ email })
    .collation({locale: "en", strength: 2})
    .lean()
    .exec();

    if(duplicate) {
        return res.status(400).json({ message: "Duplicate email" })
    }

    // Generate password
    const password = generator.generate({
        length: 8,
        numbers: true,
        uppercase: true,
        lowercase: true
    });

    // Hash password
    // const hashedPwd = await bcrypt.hash(password, 10)   // salt rounds

    // Create and store the new recruiter
    const recruiter = await Recruiter.create({ companyID, name, gender, email, password, })

    if (recruiter) {
        return res.status(201).json({ message: `New user ${email} with password: ${password} created` })
    } else {
        return res.status(400).json({ message: "Invalid recruiter data received" })
    }

}

// Get a recruiter
// POST /recruiter/:id
const getRecruiter = async (req, res) => {

    let recruiter = await Recruiter.findById(req.params.id)

    if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found"})
    }

    const company = await Company.findById(recruiter.companyID).lean().exec()

    const foundRecruiter = {
        _id: recruiter._id,
        name: recruiter.name,
        companyID: recruiter.companyID,
        company: company.name,
        gender: recruiter.gender,
        email: recruiter.email,
        password: recruiter.password
    }

    return res.status(200).json(foundRecruiter)
    
}

module.exports = {
    getAllRecruiters,
    createNewRecruiter,
    getRecruiter
}