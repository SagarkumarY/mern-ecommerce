import Coupon from '../models/coupon.model.js';

// Get the active coupon for the current user
export const getCoupon = async (req, res) => {
    try {
        // Find the active coupon for the current user
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });


        if (!coupon) {
            // If no active coupon is found, return a 404 error
            return res.status(404).json({ message: "Coupon not found." });
        }

        res.json(coupon); // Send the coupon data to the client
    } catch (error) {
        console.error("Error getting coupon:", error.message);
        res.status(500).send("Server Error getting coupon");
    }
};

// Validate a coupon code for the current user
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body; // Get the coupon code from the request body

        // Find the active coupon with the provided code for the current user
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

        if (!coupon) {
            // If no such coupon is found, return a 404 error
            return res.status(404).json({ message: "Coupon not found." });
        }

        // Check if the coupon is expired
        if (coupon.expirationDate < new Date()) {
            // If the coupon is expired, deactivate it and save the change
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({ message: "Coupon expired." });
        }

        // If the coupon is valid, return the discount information
        res.json({
            message: "Coupon valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        console.error("Error validating coupon:", error.message);
        res.status(500).send("Server Error validating coupon");
    }
};
