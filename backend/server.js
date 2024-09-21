// Importing necessary modules
import express from 'express'; // Express framework for building the server
import dotenv from 'dotenv'; // To load environment variables from .env file
import cookieParser from 'cookie-parser'; // Middleware to parse cookies

// Importing route modules
import authRoutes from './routes/auth.route.js'; // Authentication routes
import productRoutes from './routes/product.route.js'; // Product routes
import cartRoutes from './routes/cart.route.js'; // Shopping cart routes
import couponRoutes from './routes/coupon.route.js'; // Coupon management routes
import paymentRoutes from './routes/payment.route.js'; // Payment processing routes
import analyticsRoutes from './routes/analytics.route.js'; // Analytics routes
import connectDB from './lib/db.js'; // Function to connect to the database
import path from 'path'

// Load environment variables from .env file
dotenv.config();


// Create the Express application instance
const app = express();

// Define the port number, using environment variable or defaulting to 5000
const PORT = process.env.PORT || 5000;

const  __dirname = path.resolve()



// Middleware to parse incoming requests with JSON payloads
app.use(express.json({limit: "10mb"}));
// Middleware to parse cookies in request headers
app.use(cookieParser());





// Routes for different parts of the application
// Each route is responsible for a specific set of functionalities
app.use("/api/auth", authRoutes); // Routes related to user authentication (login, signup, etc.)
app.use("/api/products", productRoutes); // Routes related to product management (CRUD operations)
app.use("/api/cart", cartRoutes); // Routes related to the shopping cart (adding/removing products, etc.)
app.use("/api/coupons", couponRoutes); // Routes related to coupons (creation, redemption, etc.)
app.use("/api/payments", paymentRoutes); // Routes for handling payments and Stripe integration
app.use("/api/analytics", analyticsRoutes); // Routes related to admin analytics (sales, revenue, etc.)


if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, '/frontend/dist')));


  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}



// Start the server and listen on the defined port
app.listen(5000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  // Connect to the database once the server starts
  connectDB();
});
