![Alt text](https://res.cloudinary.com/ddnuizxcz/image/upload/v1726937017/Screenshot_2024-09-21_220926_npqhrs.png)


# MERN E-Commerce Project

This is a full-stack E-Commerce application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It supports various features like user authentication, product management, shopping cart functionality, and payment integration using Stripe.
Table of Contents

 1. Features
 2. Technologies
 3. Installation
 4. Prerequisites
 5. Backend Setup
 6. Frontend Setup
 7. Environment Variables
 8. Running the Application
 9. License



## 1. Features
 
 The application includes the following features:

    User Authentication: Users can sign up, log in, and manage their profiles.
    Product Management: Admins can add, edit, and delete products.
    Shopping Cart: Users can add products to their cart and proceed to checkout.
    Payment Integration: Secure payments are handled via Stripe.
    Order Management: Users can view their order history.
    Responsive Design: The application is optimized for both desktop and mobile devices.




## 2. Technologies

Backend:

    Node.js: JavaScript runtime for server-side logic.
    Express.js: Backend framework for building APIs.
    MongoDB: NoSQL database for storing product, user, and order information.
    Mongoose: ODM for MongoDB to manage data models.
    JWT (JSON Web Tokens): For user authentication.
    Bcrypt: Password hashing for user security.
    Stripe: Payment gateway integration.

Frontend:

    React: JavaScript library for building user interfaces.
    React Router: For routing between different components/pages.
    Zustand: State management for React.
    Framer Motion: For animations.
    Axios: To handle HTTP requests.
    Tailwind CSS: Utility-first CSS framework for styling.
    React Hot Toast: For notifications and alerts.
    Recharts: For displaying visual data (e.g., charts).

## 3. Installation

To run this project locally, follow these steps:
Prerequisites

    Node.js: Ensure you have Node.js installed (version 16.x or later).
    MongoDB: Install MongoDB locally or use MongoDB Atlas for a cloud-hosted database.
    Stripe Account: Set up a Stripe account to get your API keys.




## Backend Setup
### 1. Clone the repository:



    git clone https://github.com/your-username/mern-ecommerce.git

     cd mern-ecommerce


### 2.Install backend dependencies:
cd backend

     npm install


### 3. Create a .env file in the backend directory and add the following:

    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key


### 4.Start the backend server:
    npm run dev


## .Frontend Setup

Navigate to the frontend directory and install dependencies:

     cd frontend

     npm install



Create a .env file in the frontend directory and add the following:

    VITE_API_URL=http://localhost:5000
    VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key


Start the frontend development server:


     npm run dev


Environment Variables

Ensure you have the following environment variables for the backend and frontend:
Backend

    PORT: Port on which the backend server will run.
    MONGO_URI: MongoDB connection string.
    JWT_SECRET: Secret key for signing JWT tokens.
    CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: Credentials for Cloudinary for handling image uploads.
    STRIPE_SECRET_KEY: Secret key from your Stripe account.

Frontend

    VITE_API_URL: The URL where the backend is running (default: http://localhost:5000).
    VITE_STRIPE_PUBLIC_KEY: Stripe public key for handling payments on the client-side.

Running the Application

Once both the frontend and backend are set up:

Start the backend:


     npm run dev

Start the frontend:



    cd frontend
    npm run dev

Visit http://localhost:3000 in your browser to view the application.
License

This project is licensed under the ISC License.








