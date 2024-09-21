import Product from "../models/product.model.js";


// Get all products in the user's cart
export const getCartProducts = async (req, res) => {
    try {
        // Check if req.user and req.user.cartItems are defined
        if (!req.user || !req.user.cartItems) {
            console.error("User or cartItems are undefined:", req.user);
            return res.status(400).send("User or cartItems are undefined");
        }

        // Get the cart items from the user's data
        const cartItems = req.user.cartItems;

        // Ensure cartItems is an array
        if (!Array.isArray(cartItems)) {
            console.error("cartItems is not an array:", cartItems);
            return res.status(400).send("cartItems should be an array");
        }

        // Extract product IDs from the cart items
        const productIds = cartItems.map(item => item.product);

        // Find all products that are in the user's cart using their IDs
        const products = await Product.find({ _id: { $in: productIds } });

        // Map over the products to include the quantity for each cart item
        const cartProducts = products.map(product => {
            const cartItem = cartItems.find(item => item.product.toString() === product._id.toString());
            return {
                ...product.toJSON(),
                quantity: cartItem ? cartItem.quantity : 0
            };
        });

        res.json(cartProducts); // Send the cart items to the client
    } catch (error) {
        console.error("Error fetching cart products:", error.message);
        res.status(500).send("Server Error fetching Cart Products controller");
    }
};





// Add a product to the user's cart
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body; // Get the product ID from the request body

        const user = req.user; // Ensure req.user is populated correctly

        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Initialize cartItems if undefined
        if (!user.cartItems) {
            user.cartItems = [];
        }

        // Check if the product is already in the cart
        const existingItem = user.cartItems.find(item => item.product.toString() === productId);

        // console.log("Existing Item:", existingItem);

        if (existingItem) {
            // If the product is already in the cart, increase its quantity by 1
            existingItem.quantity++;
        } else {
            // If the product is not in the cart, add it with a quantity of 1
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save(); // Save the updated cart to the database



        // // Check the total cart amount
        // let totalAmount = 0;
        // const cartProducts = await Product.find({ _id: { $in: user.cartItems.map(item => item.product) } });
     

        // // Calculate total amount in the cart
        // user.cartItems.forEach(item => {
        //     const product = cartProducts.find(p => p._id.toString() === item.product.toString());
        //     totalAmount += product?.price * item.quantity;
        // });

        // // If the total is $200 or more, create a coupon and assign it to the user
        // if (totalAmount >= 200 && !user.couponCreated) {
        //     const coupon = await createNewCoupon(user._id); // Create a new coupon (10% discount)
        //     user.couponCreated = true; // Mark that the coupon has been created for this user
        //     await user.save();
        //     return res.json({
        //         cartItems: user.cartItems,
        //         message: `Coupon created! Use code ${coupon.code} for a 10% discount.`,
        //         couponCode: coupon.code,
        //     });
        // }


        res.json(user.cartItems); // Send the updated cart items to the client
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).send("Server Error adding to cart.");
    }
};



// Update the quantity of a specific product in the user's cart
export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params; // Get the product ID from the request parameters
     
        const { quantity } = req.body; // Get the new quantity from the request body
 
        const user = req.user; // Get the user from the request
  

        // Find the product in the cart
        const existingItem = user.cartItems.find(item => item.product.toString() === productId);

        if (existingItem) {
            if (quantity === 0) {
                // If the quantity is 0, remove the product from the cart
                user.cartItems = user.cartItems.filter(item => item.product.toString() !== productId);
            } else {
                // Otherwise, update the quantity of the product
                existingItem.quantity = quantity;
            }
            await user.save(); // Save the updated cart to the database

            res.json(user.cartItems); // Send the updated cart items to the client
        } else {
            // If the product is not found in the cart, return a 404 error
            return res.status(404).json({ message: "Product not found in the cart" });
        }
    } catch (error) {
        console.error("Error updating cart quantity:", error.message);
        res.status(500).send("Server Error updating quantity controller");
    }
};



// Remove a specific product or all products from the user's cart
export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body; // Get the product ID from the request body
 
        const user = req.user; // Get the authenticated user from the request


        // Check if the user is authenticated
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Ensure cartItems is an array (fallback to an empty array if undefined)
        if (!Array.isArray(user.cartItems)) {
            user.cartItems = [];
        }

        // If the cart is already empty, return early
        if (user.cartItems.length === 0) {
            return res.json({ message: "Cart is already empty", cartItems: user.cartItems });
        }

        // If no product ID is provided, clear the entire cart
        if (!productId) {
            user.cartItems = []; // Clear all cart items
        } else { 

            // Find the product in the cartItems by directly comparing the productId (string comparison)
            const productExists = user.cartItems.find(item => item.product.toString() === productId);

            // If the product is not found in the cart, return a 404 Not Found error
            if (!productExists) {
                return res.status(404).json({ message: "Product not found in cart" });
            }

            // Remove the product from the cart by filtering it out
            user.cartItems = user.cartItems.filter(item => item.product.toString() !== productId);
        }

        // Save the updated cart to the database
        await user.save();

        // Send the updated cart back to the client
        res.json({ message: "Cart updated successfully", cartItems: user.cartItems });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error removing from cart:", error.message);

        // Send a 500 error response to the client
        res.status(500).send("Server Error removing from Cart controller");
    }
};










// Get all products in the user's cart
// export const getCartProducts = async (req, res) => {
//     try {
//         // Find all products that are in the user's cart using their IDs
//         const products = await Product.find({ _id: { $in: req.user.cartItems.map(item => item.id) } });

//         // Map over the products to include the quantity for each cart item
//         const cartItems = products.map(product => {
//             const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
//             return {
//                 ...product.toJSON(),
//                 quantity: item.quantity
//             };
//         });

//         res.json(cartItems); // Send the cart items to the client
//     } catch (error) {
//         console.error("Error fetching cart products:", error.message);
//         res.status(500).send("Server Error fetching Cart Products controller");
//     }
// };
