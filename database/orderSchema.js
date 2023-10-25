const { Schema, model } = require('mongoose');

const orderSchema = new Schema ({
    buyerId: {
        type: String,
        required: true,
        unique: true
    },
    sellerId: {
        type: String,
        required: true,
        unique: true
    },
    itemsList: [{
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

const OrderModel = model('orders', orderSchema);

module.exports = { OrderModel };