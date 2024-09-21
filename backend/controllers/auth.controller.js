import redis from '../lib/redis.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateTokens, storeRefreshToken, setCookie } from '../lib/authHelpers.js';

// Signup function
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        // Hash the password before saving the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with the hashed password
        const user = new User({ name, email, password: hashedPassword });

        // Save the user to the database
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Store refresh token in Redis
        await storeRefreshToken(user._id, refreshToken);

        // Set tokens in cookies
        setCookie(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: "An error occurred while registering the user." });
    }
};

// Login function
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Store refresh token in Redis
        await storeRefreshToken(user._id, refreshToken);

        // Set tokens in cookies
        setCookie(res, accessToken, refreshToken);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "An error occurred while logging in." });
    }
};

// Logout function
export const logout = async (req, res) => {
    try {
        // Extract refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided." });
        }

        // Decode the refresh token to get the user ID
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.id;

        // Remove the refresh token from Redis
        await redis.del(`refresh_token_${userId}`);

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: "An error occurred while logging out." });
    }
};


//this will refresh the access token
export const refreshToken = async (req, res) => {
    try {
        // Extract the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided." });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const userId = decoded.id;

        // Retrieve the stored refresh token from Redis
        const storedToken = await redis.get(`refresh_token_${userId}`);

        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }


        // Generate a new access token
        const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
   

        // Set the new access token in cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: "strict",
        });

        res.json({ message: "Access token refreshed successfully." });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: "An error occurred while refreshing the access token." });
    }
};



// get profile
export const getProfile = async (req,res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "An error occurred while getting the user profile." });
    }
}











// -- before changing the code here

// Generate tokens
// const generateTokens = (id) => {
//     const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
//     return { accessToken, refreshToken };
// };

// Save refresh token in Redis
// const storeRefreshToken = async (userId, refreshToken) => {
//     await redis.set(`refresh_token_${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
// };

// Set cookies
// const setCookie = (res, accessToken, refreshToken) => {
//     res.cookie("accessToken", accessToken, {
//         httpOnly: true,
//         maxAge: 15 * 60 * 1000, // 15 minutes
//         secure: process.env.NODE_ENV === 'production', // Set to true in production
//         sameSite: "strict",
//     });
//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         secure: process.env.NODE_ENV === 'production', // Set to true in production
//         sameSite: "strict",
//     });
// };







// // Signup function
// export const signup = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         // Create a new user and hash password
//         const hashedPassword = await bcrypt.hash(password, 10); // Ensure password is hashed before saving
//         const user = new User({ email, password: hashedPassword, name });

//         // Save the user
//         await user.save();

//         // Authenticate and generate tokens
//         const { accessToken, refreshToken } = generateTokens(user._id);

//         // Save refresh token in Redis
//         await storeRefreshToken(user._id, refreshToken);

//         // Set cookies with the tokens
//         setCookie(res, accessToken, refreshToken);

//         // Send response with user data
//         res.status(201).json({
//             message: "User registered successfully",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         console.error('Signup error:', error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };



// // Login function
// export const login = async (req, res) => {
//     // Extract email and password from request body
//     const { email, password } = req.body;

//     try {
//         // Check if user exists in the database
//         const user = await User.findOne({ email });
//         let pas = user.password
//         console.log("User hash password", typeof pas)

//         if (!user) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }


//         // Compare provided password with the hashed password stored in the database
//         const isMatch = await user.comparePassword(password);
//         console.log('Password match result:', isMatch);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         // Generate JWT tokens
//         const { accessToken, refreshToken } = generateTokens(user._id);
//         console.log(`Access Token: ${accessToken}`);

//         // Store the refresh token in Redis with an expiration of 7 days
//         await storeRefreshToken(user._id, refreshToken);

//         // Set the tokens in cookies
//         setCookie(res, accessToken, refreshToken);

//         // Respond with success and user details
//         res.status(200).json({
//             message: "Login successful",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         console.error('Login error:', error); // Log error for debugging
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };
