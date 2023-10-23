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
    itemsList: {
        type: Object,
        required: true
    }
})

const OrderModel = model('order', orderSchema);

module.exports = { OrderModel };