import jwt from 'jsonwebtoken';
import redis from './redis.js';

// Generate JWT tokens
export const generateTokens = (id) => {
    const accessToken = jwt.sign({ id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Store the refresh token in Redis
export const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token_${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
};

// Set tokens in cookies
export const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 minutes
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: "strict",
    });
};



