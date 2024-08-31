const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    comments: Array
});

module.exports = mongoose.model("Books", bookSchema);