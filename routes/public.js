const express = require('express');
const router = express.Router();
const { UserModel } = require('../database/userSchema');
const { OrderModel } = require('../database/orderSchema');
const { CatalogModel } = require('../database/catalogSchema');
const decodeToken = require('../controller/tokenValidation');


// Fetch list of sellers
router.get('/buyer/list-of-sellers', decodeToken, async (req, res) => {
    try {
        const sellersList = await UserModel.find({ userType: 'seller' });
        if (sellersList.length == 0) {
            return res.status(401).json({ message: "No sellers found." });
        }
        sellersList.map((seller) => {
            const list = {
                name: seller.name,
                id: seller.userId
            };
            
            res.status(200).json({ message: "Data found.", list: list });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
})

// Fetching the items list of a seller
router.get('/buyer/seller-catalog/:seller_id', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.params;
        const sellerExist = await CatalogModel.findOne({ userId: seller_id });
        if (!sellerExist) {
            return res.status.json({ message: "Seller doesn't exist or do not have an itinerary." });
        }
        const items = sellerExist.products;
        res.status.json({ message: "Seller found, here's the items he sells.", data: items });
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
        const sellerExist = await CatalogModel.findOne({ userId: seller_id });
        if (!userExist) {
            return res.status.json({
                message: "No users found, please register before ordering something."
            });
        }
        if (!sellerExist) {
            return res.status.json({ message: "Seller doesn't exist or do not have an itinerary." });
        } else if (!(sellerExist.products == itemsList)) {
            return res.status.json({
                message: "Seller do not sell the given items list, Choose from this given list.",
                List: sellerExist.products
            });
        }
        const newOrder = new OrderModel({ userId, seller_id, itemsList }).save();
        res.status(200).json({
            message: "Order created successfully, here's the list you ordered.",
            data: newOrder
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." })
    }
})

/***************************************************************************************/

// Creating Catalog and inserting the items
router.post('/seller/create-catalog', decodeToken, async (req, res) => {
    try {
        const { seller_id, items } = req.body;
        const verifySeller = await UserModel.findOne({ userId: seller_id, userType: 'seller' });
        if (!verifySeller) {
            return res.status.json({ note: "The user is not a seller." });
        }
        const sellerExist = await CatalogModel.findOne({ sellerId: seller_id });
        console.log(typeof(items));
        if (!sellerExist) {
            new CatalogModel({ seller_id, items }).save();
        }
        sellerExist.products.append(items);
    } catch (err) {
        console.log(err);
    }

})

// Retrieving the list of items ordered by buyer
router.get('/seller/orders', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.body;
        const orderExist = await OrderSchema.find({ sellerId: seller_id });
        if (orderExist.length == 0) {
            return res.status.json({ message: "No pending orders." });
        } else {
            orderExist.map((order) => {
                return {
                    Buyer: order.buyerId,
                    Items: order.itemsList
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error." });
    }
})


module.exports = router;