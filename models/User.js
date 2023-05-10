const mongoose = require('mongoose')

const companyIDSchema = new mongoose.Schema()

const userSchema = new mongoose.Schema({
    regNo: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: '',
    },
    course: {
        type: String,
        default: '',
    },
    branch: {
        type: String,
        default: '',
    },
    branchCode: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'O']
    }, 
    dob: {
        type: String,
        default: ''
    }, 
    profileStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Closed']
    },
    email: {
        type: String,
        default: ''
    }, 
    linkedin: {
        type: String,
        default: ''
    }, 
    skype: {
        type: String,
        default: ''
    }, 
    category: {
        type: String,
        enum: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS']
    }, 
    physicallyChallenged: {
        type: String,
        enum: ['YES', 'NO']
    }, 
    residentialStatus: {
        type: String,
        enum: ['dayScholar', 'hosteller']
    },
    roles: {
        type: [String],
        default: ["Student"]
    },
    cpi: {
        type: Number,
    },
    currBacklogs: {
        type: Number
    },
    totalBacklogs: {
        type: Number
    },
    credits: {
        type: Number,
        default: 10
    },
    resume: {
        type: String
    },
    photo: {
        type: String
    },
    placed: {
        type: Boolean,
        default: false
    },
    companyId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyForm",
    }]
})

module.exports = mongoose.model('User', userSchema)