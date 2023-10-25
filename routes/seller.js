const express = require('express');
const router = express.Router();
const { UserModel } = require('../database/userSchema');
const { OrderModel } = require('../database/orderSchema');
const { CatalogModel } = require('../database/catalogSchema');
const decodeToken = require('../controller/tokenValidation');


// Creating Catalog and inserting the items
router.post('/create-catalog', decodeToken, async (req, res) => {
    try {
        const { seller_id, items } = req.body;
        const verifySeller = await UserModel.findOne({ userId: seller_id, userType: 'seller' });
        if (!verifySeller) {
            return res.status(400).json({ error: "The user is not a seller." });
        }
        // checking if seller catalog exist in db, if no create new document, else update the previous one
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
router.get('/orders', decodeToken, async (req, res) => {
    try {
        const { seller_id } = req.body;
        const orderExist = await OrderModel.find({ sellerId: seller_id });
        if (orderExist.length == 0) {
            return res.status(400).json({ message: "No pending orders." });
        } else {
            // mapping all the orders by multiple users
            const ordersList = await orderExist.map((order) => {
                if (order) {
                    const items = order.itemsList.map((item) => {
                        return {
                            item: item.item,
                            price: item.price
                        }
                    })
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