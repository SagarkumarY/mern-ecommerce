import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getAnalytics, getDailySalesData } from '../controllers/analytics.controller.js'; // fixed function name

const router = express.Router();

// Route to get analytics data for the admin dashboard
router.get('/', protectRoute, adminRoute, async (req, res) => {
    try {
        // Fetch overall analytics like total users, total sales, etc.
        const analytics = await getAnalytics();

        // Define the date range (last 7 days)
        const endDate = new Date(); // Current date
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        // Fetch daily sales data for the specified date range
        const dailySalesData = await getDailySalesData(startDate, endDate); // fixed typo

        // Respond with analytics and daily sales data
        res.json({ analytics, dailySalesData });
    } catch (error) {
        console.error('Error in analytics route:', error);
        res.status(500).json({ message: 'An error occurred while retrieving analytics.' });
    }
});

export default router;
