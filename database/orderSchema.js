const { Schema, model } = require('mongoose');

const orderSchema = new Schema ({
    buyerId: {
        type: String,
        required: true
    },
    sellerId: {
        type: String,
        required: true
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