const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String,

    amount: Number,

    category: String,

    note: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Account",
    accountSchema
);