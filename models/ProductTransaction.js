const mongoose = require('mongoose');

const ProductTransactionSchema = new mongoose.Schema({
    productTitle: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    dateOfSale: {
        type: Date,
        required: true
    },
    isSold: {
        type: Boolean,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ProductTransaction', ProductTransactionSchema);
