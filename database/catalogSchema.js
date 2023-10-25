const { Schema, model } = require('mongoose');

const CatalogSchema = new Schema ({
    sellerId: {
        type: String,
        required: true,
        unique: true
    },
    products: [{
        item: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }]
})

const CatalogModel = model('catalogs', CatalogSchema);

module.exports = { CatalogModel };