@E-Commerce Backend API :-

>> Structure :
    -> Packages used    : Express, Mongoose, Bcrypt, UUID
    -> Dev Dependencies : Nodemon

    -> Root :
        app.js : root/main file having all the necessary connections
        -> routes (dir) :
            auth.js   : routes for register user/seller and login (generate unique token)
            buyer.js  : all the routes related to buyer
            seller.js : all the routes related to seller
        
        -> database (dir) :
            dbConnect.js     : connection to mongoDB
            userSchema.js    : schema for the 'users' collection ( name, user-id, password, user-type )
            catalogSchema.js : schema for the 'catalogs' collection ( seller-id, products(item, price) )
            orderSchema.js   : schema for the 'orders' collection ( buyer-id, seller-id, items-list )

        -> controller (div) :
            tokenValidation.js : middleware for token validation


>> Instructions to deploy in your local machine:
    -> Clone the repository into the local machine
    -> Open the repository in VS Code
    -> Open Terminal, and type "npm install" or "yarn install" (All the Packages will get installed)
    -> Use "nodemon" or "node app.js" to run the localhost (PORT is 5000)
    -> Use POSTMAN application, put the URL ( e.g. localhost:5000/api/auth/login )
    
    *** IMPORTANT ***
    
    ALL THE URLs (except the /register and /login) WILL WORK ONLY WHEN THE TOKEN GENERATED DURING LOGIN WILL GET PASSED INTO THE HEADERS AS "auth <generated_token>"

    This is done to verify that it is logged-in person who is querying the database.
    
    ******************