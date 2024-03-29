const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    likedQuizzes: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: Object,
        contains: {
            url: {
                type: String
            },
            publicId: {
                type: String
            }
        }
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Korisnik', UserSchema);