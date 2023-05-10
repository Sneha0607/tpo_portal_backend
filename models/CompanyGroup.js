const mongoose = require("mongoose");

const companyGroupSchema = new mongoose.Schema({
  companyFormID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "CompanyForm",
  },
  name: {
    type: String,  // companyName + Profile + Year
    required: true
  },
  admin: {
    type: [String],
  },
  members: {
    type: [String],
  },
  chats: [{
      message: {
        type: String,
      },
      senderID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Users",
      },
      sentAt: {
        type: Date
        // timestamp
      }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("CompanyGroup", companyGroupSchema);