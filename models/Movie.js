const mongoose = require('mongoose');

const movieSchema = {
    title: String,
    year: Number,
    description: String,
    rank: Number,
    category: String
};


exports.Movie = mongoose.model('Movie', movieSchema);