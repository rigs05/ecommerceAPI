const { Schema, model } = require('mongoose');

const catalogueSchema = new Schema ({
    sellerId: {
        type: String,
        required: true,
        unique: true
    },
    products: {
        type: Object,
        required: true
    },
})

const CatalogueModel = model('catalogue', catalogueSchema);

module.exports = { CatalogueModel };