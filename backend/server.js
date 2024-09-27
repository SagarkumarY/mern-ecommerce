import express from 'express'; // Express framework for building the server
import dotenv from 'dotenv'; // To load environment variables from .env file
import cookieParser from 'cookie-parser'; // Middleware to parse cookies
import nodemailer from 'nodemailer'
import path from 'path'

// Importing route modules
import authRoutes from './routes/auth.route.js'; // Authentication routes
import productRoutes from './routes/product.route.js'; // Product routes
import cartRoutes from './routes/cart.route.js'; // Shopping cart routes
import couponRoutes from './routes/coupon.route.js'; // Coupon management routes
import paymentRoutes from './routes/payment.route.js'; // Payment processing routes
import analyticsRoutes from './routes/analytics.route.js'; // Analytics routes
import connectDB from './lib/db.js'; // Function to connect to the database
import generateInvoice from './lib/invoiceGenerator.js';

// Load environment variables from .env file
dotenv.config();


// Create the Express application instance
const app = express();

// Define the port number, using environment variable or defaulting to 5000
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve()



// Middleware to parse incoming requests with JSON payloads
app.use(express.json({ limit: "10mb" }));
// Middleware to parse cookies in request headers
app.use(cookieParser());






// Define the route to generate the PDF invoice and send it via email
app.post('/api/send-invoice', async (req, res) => {
  const { name, email, items } = req.body;
 
  try {
    // Generate the invoice PDF and get the file path
    const invoicePath = await generateInvoice(name, email, items);

    // Create a transporter object using Gmail SMTP service
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Replace with your email address
        pass: process.env.PASSWORD // Replace with your email password or app-specific password
      }
    });

    // Define the email options
    let mailOptions = {
      from: process.env.EMAIL, // Sender address (your email)
      to: email, // Recipient's email (from request body)
      subject: 'Your Invoice', // Email subject
      text: `Dear ${name},\n\nThank you for your purchase! Please find your invoice attached.`,
      attachments: [
        {
          filename: `${name}-invoice.pdf`, // Name of the PDF attached to the email
          path: invoicePath // Path to the PDF file on the server
        }
      ]
    };

    // Send the email with the invoice attached
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Invoice sent successfully!' }); // Send success response to frontend
  } catch (error) {
    console.error('Error generating or sending invoice:', error);
    res.status(500).json({ message: 'Error generating or sending invoice.' }); // Send error response to frontend
  }
});





// Routes for different parts of the application
// Each route is responsible for a specific set of functionalities
app.use("/api/auth", authRoutes); // Routes related to user authentication (login, signup, etc.)
app.use("/api/products", productRoutes); // Routes related to product management (CRUD operations)
app.use("/api/cart", cartRoutes); // Routes related to the shopping cart (adding/removing products, etc.)
app.use("/api/coupons", couponRoutes); // Routes related to coupons (creation, redemption, etc.)
app.use("/api/payments", paymentRoutes); // Routes for handling payments and Stripe integration
app.use("/api/analytics", analyticsRoutes); // Routes related to admin analytics (sales, revenue, etc.)


if (process.env.NODE_ENV === "production") {
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
