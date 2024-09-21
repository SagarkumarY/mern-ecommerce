import Coupon from '../models/coupon.model.js';
import { stripe } from '../lib/stripe.js';
import Order from '../models/order.model.js';

// Create a checkout session for the user
export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
            

        // Validate that 'products' is an array and is not empty
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Products array is required and must not be empty." });
        }

        let totalAmount = 0; // Initialize total amount for all products in cents

        // Map through the products and calculate total price
        const lineItems = products.map(product => {

            if (!product.name || !product.price || !product.quantity || !product.image) {
                throw new Error("Invalid product data. Ensure each product has a name, price, quantity, and image.");
            }
            const amount = Math.round(product.price * 100); // Convert product price to cents
            totalAmount += amount * product.quantity; // Add product price to total based on quantity

            return {
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: product.name,
                        images: [product.image], // Array of image URLs
                    },
                    unit_amount: amount, // Stripe expects price in cents
                },
                quantity: product.quantity // Specify the product quantity
            };
        });

        let coupon = null;

        // If a coupon code is provided, validate the coupon
        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                userId: req.user._id,
                isActive: true
            });

            // If no valid coupon is found, return an error response
            if (!coupon) {
                return res.status(400).json({ message: "Invalid coupon code." });
            }

            // Apply coupon discount to total amount
            totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
        }

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Only card payment is supported in this case
            line_items: lineItems, // Line items (products) for the session
            mode: 'payment', // Payment mode (can also be 'subscription' or 'setup')
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`, // Redirect after successful payment
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel?session_id={CHECKOUT_SESSION_ID}`, // Redirect if payment is cancelled

            // Apply discounts if a valid coupon exists
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage), // Create and apply coupon in Stripe
                }
            ] : [],

            // Pass metadata for later reference (can include user info, coupon codes, etc.)
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",// Save coupon code (if used) in metadata
                products: JSON.stringify(
                    products.map(product => ({
                        id: product._id,
                        price: product.price,
                        quantity: product.quantity
                    }))
                )
            },
        });

        // If the total amount exceeds 200 USD (or 20000 cents), generate a new coupon for the user
        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }

        // Respond with the session ID and total amount (converted back to dollars)
        res.json({
            sessionId: session.id,
            totalAmount: (totalAmount / 100).toFixed(2) // Convert back to dollars for display
        });

    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};




// Export the checkoutSuccess function to handle Stripe checkout success
export const checkoutSuccess = async (req, res) => {
	try {
		// Extract sessionId from the request body
		const { sessionId } = req.body;
		
		// Retrieve the session from Stripe using the sessionId
		const session = await stripe.checkout.sessions.retrieve(sessionId);
    

		// Check if the payment was successful
		if (session.payment_status === "paid") {

            // Check if an order already exists for this session
			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				return res.status(200).json({
					success: true,
					message: "Order already processed.",
					orderId: existingOrder._id,
				});
			}
			
			// If the session contains a coupon code, deactivate it for the user
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode, // Find the coupon by code and user ID
						userId: session.metadata.userId,
					},
					{
						isActive: false, // Deactivate the coupon once used
					}
				);
			}

			// Parse the list of products from the session metadata (stored as a string)
			const products = JSON.parse(session.metadata.products);


			
			// Create a new order with the user ID, products, total amount, and Stripe sessionId
			const newOrder = new Order({
				user: session.metadata.userId, // The user who placed the order
				products: products.map((product) => ({
					product: product.id,       // Product ID
					quantity: product.quantity, // Quantity ordered
					price: product.price,       // Price of the product
				})),
				totalAmount: session.amount_total / 100, // Convert total amount from cents to dollars
				stripeSessionId: sessionId,              // Store the Stripe session ID
			});



			// Save the new order in the database
			await newOrder.save();

			// Send a response indicating success, with the order ID included
			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id, // Return the order ID for reference
			});
		}
	} catch (error) {
		// Log any errors and return an error response
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ 
			message: "Error processing successful checkout", 
			error: error.message // Include the error message for debugging
		});
	}
};







// Helper function to create a Stripe coupon
async function createStripeCoupon(discountPercentage) {
    try {

    
        // Create a coupon in Stripe with the provided discount percentage
        const coupon = await stripe.coupons.create({
            duration: 'once', // Coupon will apply only once
            percent_off: discountPercentage, // Stripe accepts percentage off for coupons
        });

        return coupon.id; // Return the Stripe coupon ID
    } catch (error) {
        console.error("Error creating Stripe coupon:", error.message);
        throw new Error("Error creating Stripe coupon");
    }
};





// Helper function to create a new coupon in the database
async function createNewCoupon(userId) {
    try {

        await Coupon.findOneAndDelete({userId:userId})
        // Generate a new coupon code for the user
        const newCoupon = new Coupon({
            userId, // Associate the coupon with the user
            code: 'GIFT' + Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate random code
            discountPercentage: 10, // Default discount percentage
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expiration 30 days from now
        });

        // Save the coupon in the database
        await newCoupon.save();
        return newCoupon;
    } catch (error) {
        console.error("Error creating new coupon:", error.message);
        throw new Error("Error creating new coupon");
    }
}
