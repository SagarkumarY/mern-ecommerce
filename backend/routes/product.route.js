import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendatedProducts, toggleFeaturedProduct } from '../controllers/product.controller.js';

const router = express.Router();


router.get('/', protectRoute, adminRoute, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/recommendations', getRecommendatedProducts);
router.post('/', protectRoute, adminRoute, createProduct);
router.put('/:id', protectRoute, adminRoute, toggleFeaturedProduct);
router.delete('/:id', protectRoute, adminRoute, deleteProduct);





export default router;
