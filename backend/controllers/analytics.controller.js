import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Function to get overall analytics: total users, products, sales, and revenue

// export const getAnalytics = async () => {
//     try {
//         // Fetch total user count
//         const totalUsers = await User.countDocuments();

//         // Fetch total product count
//         const totalProducts = await Product.countDocuments();

//         // Fetch total sales and total revenue from the orders
//         const salesData = await Order.aggregate([
//             {
//                 $group: {
//                     _id: null, // No grouping by specific field
//                     totalSales: { $sum: 1 }, // Count total orders
//                     totalRevenue: { $sum: "$totalPrice" }, // Sum total revenue from 'totalPrice'
//                 }
//             }
//         ]);

//         // Destructure sales and revenue data (provide defaults in case of no sales)
//         const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};

//         return {
//             users: totalUsers,
//             products: totalProducts,
//             totalSales,
//             totalRevenue
//         };
//     } catch (error) {
//         console.error("Error fetching analytics:", error.message);
//         throw new Error("Error fetching analytics.");
//     }
// };



export const getAnalytics = async () => {
    try {


        // Fetch total user count
        const totalUsers = await User.countDocuments();


        // Fetch total product count
        const totalProducts = await Product.countDocuments();
       

        // Fetch total sales and total revenue from the orders
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null, // No grouping by specific field
                    totalSales: { $sum: 1 }, // Count total orders
                    totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } }, // Sum total revenue
                }
            }
        ]);
     
 
        // Destructure sales and revenue data
        const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};
     

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue
        };
    } catch (error) {
        console.error("Error fetching analytics:", error.message);
        throw new Error("Error fetching analytics.");
    }
};


// Function to get daily sales data for a specified date range
export const getDailySalesData = async (startDate, endDate) => {
    try {
        // Aggregate daily sales and revenue between the given dates
        const dailySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }, // Match orders within date range
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
                    sales: { $sum: 1 }, // Count the number of sales for the day
                    revenue: { $sum: "$totalAmount" }, // Sum total revenue for the day
                },
            },
            {
                $sort: {
                    _id: 1 // Sort by date (ascending)
                },
            },
        ]);

        // Get an array of all dates in the specified range
        const dateArray = getDateInRange(startDate, endDate);

        // Map daily sales data to each date in the range
        return dateArray.map(date => {
            const foundDate = dailySales.find(item => item._id === date);
            return {
                date, // Date string (YYYY-MM-DD)
                sales: foundDate?.sales || 0, // Sales count for that day (default to 0 if not found)
                revenue: foundDate?.revenue || 0 // Revenue for that day (default to 0 if not found)
            };
        });
    } catch (error) {
        console.error("Error getting daily sales:", error.message);
        throw new Error("Error retrieving daily sales data.");
    }
};

// Helper function to get all dates within a given date range (returns an array of date strings)
function getDateInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    // Generate date strings (YYYY-MM-DD) for each day in the range
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]); // Convert date to YYYY-MM-DD format
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
    return dates;
}
