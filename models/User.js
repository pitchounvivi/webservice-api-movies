const mongoose = require('mongoose');

const userSchema = {
    email: String,
    password: String, // normalement il faudrait le crypter/hascher
    role: String,
    age: Number,
    name: String,
    surname: String
};

// on peut créer plusieurs schémas : un par type/role



exports.User = mongoose.model('User', userSchema);