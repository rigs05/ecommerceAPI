const express = require('express');
const router = express.Router();
const { UserModel } = require('../database/userSchema');
const { OrderModel } = require('../database/orderSchema');
const { CatalogModel } = require('../database/catalogSchema');
const decodeToken = require('../controller/tokenValidation');
const util = require('util');


// Fetch list of sellers
router.get('/buyer/list-of-sellers', decodeToken, async (req, res) => {
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
router.get('/buyer/seller-catalog/:seller_id', decodeToken, async (req, res) => {
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
router.post('/buyer/create-order/:seller_id', decodeToken, async (req, res) => {
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
            console.log(availableItems);
            if (availableItems) {
                orderedItems.push({ item: itemName, price: availableItems.price });
            } else {
                unavailableItems.push(itemName);
            }
        });
        console.log(orderedItems);
        console.log(unavailableItems.length === itemsList.length);

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

/***************************************************************************************/

// Creating Catalog and inserting the items
router.post('/seller/create-catalog', decodeToken, async (req, res) => {
    try {
        const { seller_id, items } = req.body;
        // console.log(req.headers);
        // console.log(req.body);
        // console.log(typeof(items));
        const verifySeller = await UserModel.findOne({ userId: seller_id, userType: 'seller' });
        // console.log(verifySeller);
        if (!verifySeller) {
            return res.status(400).json({ error: "The user is not a seller." });
        }
        let sellerExist = await CatalogModel.findOne({ sellerId: seller_id });
        if (!sellerExist) {
            sellerExist = new CatalogModel({ sellerId: seller_id, products: items });
            await sellerExist.save();
            return res.status(200).json({ message: "Catalog created successfully." });
        }
        sellerExist.products.push(...items);
        await sellerExist.save();
        res.status(200).json({ message: "Catalog updated successfully." });
    } catch (err) {
        console.log(err);
    }
})

// Retrieving the list of items ordered by buyer
router.get('/seller/orders', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.body;
        const orderExist = await OrderModel.find({ sellerId: seller_id });
        if (orderExist.length == 0) {
            return res.status(400).json({ message: "No pending orders." });
        } else {
            const ordersList = await orderExist.map((order) => {
                if (order) {
                    const items = order.itemsList.map((item => {
                        return {
                            item: item.item,
                            price: item.price
                        }
                    }))
                    return {
                        Buyer: order.buyerId,
                        Items: items,
                    }
                }
            });
            res.status(200).json({ message: "You have some orders: ", data: ordersList });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
})


module.exports = router;