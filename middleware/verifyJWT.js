const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) 
                return res.status(403).json({ message: 'Forbidden' })
            req.regNo = decoded.UserInfo.regNo
            req.name = decoded.UserInfo.name
            req.roles = decoded.UserInfo.roles
            req.id = decoded.UserInfo.id
            // req.course = decoded.UserInfo.course
            // req.branch = decoded.UserInfo.branch
            // req.branchCode = decoded.UserInfo.branchCode
            // req.cpi = decoded.UserInfo.cpi
            // req.gender = decoded.UserInfo.gender
            // req.dob = decoded.UserInfo.dob
            // req.category = decoded.UserInfo.category
            // req.physicallyChallenged = decoded.UserInfo.physicallyChallenged
            // req.currBacklogs = decoded.UserInfo.currBacklogs
            // req.totalBacklogs = decoded.UserInfo.totalBacklogs
            // req.email = decoded.UserInfo.email,
            // req.linkedin = decoded.UserInfo.linkedin,
            // req.skype = decoded.UserInfo.skype,
            // req.resume = decoded.UserInfo.resume,
            // req.photo = decoded.UserInfo.photo,
            next()
        }
    )
}

module.exports = verifyJWT 