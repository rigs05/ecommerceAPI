const express = require('express');
const router = express.Router();
const { UserModel } = require('../database/userSchema');
const { OrderModel } = require('../database/orderSchema');
const { CatalogModel } = require('../database/catalogSchema');
const decodeToken = require('../controller/tokenValidation');

// Fetch list of sellers
router.get('/list-of-sellers', decodeToken, async (req, res) => {
    try {
        const sellersList = await UserModel.find({ userType: 'seller' });
        if (sellersList.length == 0) {
            return res.status(401).json({ message: "No sellers found." });
        }
        const list = await sellersList.map((seller) => {
            if (seller) {
                return {
                    name: seller.name,
                    sellerid: seller.userId
                } 
            }
        });
        res.status(200).json({ message: "Data found.", list: list });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
})


// Fetching the items list of a seller
router.get('/seller-catalog/:seller_id', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.params;
        const sellerExist = await CatalogModel.findOne({ sellerId: seller_id });
        if (!sellerExist) {
            return res.status(400).json({ message: "Seller doesn't exist or do not have an itinerary." });
        }
        const items = sellerExist.products;
        res.status(200).json({ message: "Seller found, here's the items he sells.", data: items });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." })
    }
})


// Creating an order from the list of items
router.post('/create-order/:seller_id', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.params;
        const { userId, itemsList } = req.body;
        const userExist = await UserModel.findOne({ userId: userId });
        const sellerExist = await CatalogModel.findOne({ sellerId: seller_id });
        if (!userExist) {
            return res.status(400).json({
                message: "No users found, please register before ordering something."
            });
        }
        if (!sellerExist) {
            return res.status(401).json({ message: "Seller doesn't exist or do not have an itinerary." });
        }
        
        const orderedItems = [];
        const unavailableItems = [];

        itemsList.forEach((itemName) => {
            const availableItems = sellerExist.products.find(oneItem => oneItem.item === itemName);
            if (availableItems) {
                orderedItems.push({ item: itemName, price: availableItems.price });
            } else {
                unavailableItems.push(itemName);
            }
        });

        if (unavailableItems.length === itemsList.length) {
            return res.status(400).json({
                message: "Seller do not sell the following items: " + unavailableItems.join(", "),
                sellerList: "Choose from this list:\n" +sellerExist.products,
            });
        }

        let orderExist = await OrderModel.findOne({ buyerId: userId, sellerId: seller_id });
        if (!orderExist) {
            orderExist = new OrderModel({ buyerId: userId, sellerId: seller_id, itemsList: orderedItems });
            await orderExist.save();
            return res.status(200).json({
                message: "Order created successfully, here's the list you ordered: " + orderExist,
                note: "Seller does not sell some of the items: " + unavailableItems.join(", ")
            });
        }

        orderExist.itemsList.push(...orderedItems);
        await orderExist.save();
        res.status(200).json({
            message: "Order updated successfully.",
            unordered: "Some items were not available with seller: " + unavailableItems
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
})

module.exports = router;