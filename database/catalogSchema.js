const { Schema, model } = require('mongoose');

const CatalogSchema = new Schema ({
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

const CatalogModel = model('catalog', CatalogSchema);

module.exports = { CatalogModel };