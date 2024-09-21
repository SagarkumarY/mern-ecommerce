import cloudinary from '../lib/cloudinary.js';
import redis from '../lib/redis.js';
import Product from '../models/product.model.js'

// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find({});
        
        // Send the products as a JSON response
        res.json({ products });

    } catch (error) {
        console.error(error.message);
        // Send a server error response if something goes wrong
        res.status(500).send("Server Error fetching products controller");
    }
};

// Get Featured Products
export const getFeaturedProducts = async (req, res) => {
    try {
        // Try to get featured products from Redis cache
        let featuredProducts = await redis.get("featured_products");

        if (featuredProducts) {
            // If found in cache, send the cached products as a JSON response
            return res.json(JSON.parse(featuredProducts));
        }

        // If not in Redis, fetch featured products from MongoDB
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        
        if (!featuredProducts) {
            // If no featured products found, send a 404 response
            return res.status(404).json({ message: "No featured products found." });
        }

        // Store the fetched products in Redis for quicker future access
        await redis.set("featured-products", JSON.stringify(featuredProducts));

        // Send the fetched products as a JSON response
        res.json(featuredProducts);

    } catch (error) {
        console.error(error.message);
        // Send a server error response if something goes wrong
        res.status(500).send("Server Error fetching featured products controller");
    }
};

// Create a New Product
export const createProduct = async (req, res) => {
    try {
        // Extract product details from the request body
        let { name, description, price, image, category } = req.body;
        
        // If an image is provided, upload it to Cloudinary
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
            image = cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : null;
        }

        // Create a new product object with the provided details
        const product = new Product({ name, description, price, image, category });
        
        // Save the new product to the database
        await product.save();

        // Send the created product as a JSON response
        res.status(201).json(product);
    } catch (error) {
        console.error(error.message);
        // Send a server error response if something goes wrong
        res.status(500).send("Server Error creating new product");
    }
}

// Delete a Product (Admin Only)
export const deleteProduct = async (req, res) => {
    try {
        // Find the product by ID in the database
        const product = await Product.findById(req.params.id);

        if (!product) {
            // If the product is not found, send a 404 response
            return res.status(404).json({ message: "Product not found." });
        }

        // If the product has an associated image, delete it from Cloudinary
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log(`Image deleted from cloudinary: ${publicId}`);
            } catch (error) {
                console.error(`Error deleting image from cloudinary: ${error.message}`);
                // Send a server error response if image deletion fails
                return res.status(500).json({ message: "Failed to delete product image from cloudinary." });
            }
        }

        // Delete the product from the database
        await Product.findByIdAndDelete(req.params.id);

        // Send a success message as a JSON response
        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        console.error(error.message);
        // Send a server error response if something goes wrong
        res.status(500).send("Server Error deleting product");
    }
};


// GET Recommended Products
export const getRecommendatedProducts = async (req, res) => {
    try {
        // Use MongoDB's aggregate pipeline to fetch random products
        const products = await Product.aggregate([
            {
                // Randomly select 3 products from the collection
                $sample: { size: 4 }
            },
            {
                // Specify which fields to include in the result
                $project: {
                    _id: 1,            // Include the product ID
                    name: 1,           // Include the product name
                    description: 1,    // Include the product description
                    price: 1,          // Include the product price
                    image: 1,          // Include the product image URL
                }
            }
        ]);

        // Return the randomly selected products as a JSON response
        res.json({ products });
    } catch (error) {
        console.error(error.message);
        // Send a server error response if something goes wrong
        res.status(500).send("Server Error fetching recommended products controller");
    }
};
 

// GET PRODUCTS BY CATEGORY
export const getProductsByCategory = async (req,res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.json({ products });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error fetching products by category controller");
    }
};


// Toggle the 'featured' status of a product
export const toggleFeaturedProduct = async (req, res) => {
    const { id } = req.params; // Extract product ID from request parameters

    try {
        // Find the product by its ID
        const product = await Product.findById(id);
        if (!product) {
            // If product is not found, return a 404 error
            return res.status(404).json({ message: "Product not found." });
        }

        // Toggle the 'isFeatured' status
        product.isFeatured = !product.isFeatured;
        await product.save(); // Save the updated product to the database

        // Update the cache for featured products after the status change
        await updateFeaturedProductsCache();

        // Send the updated product back in the response
        res.json(product);
    } catch (error) {
        // Log and return a 500 error if something goes wrong
        console.error('Error creating product:', error.message);
        res.status(500).json({ message: "Server error creating new product", error: error.message });
    }
};

// Function to update the cache of featured products in Redis
async function updateFeaturedProductsCache() {
    try {
        // Find all products where 'isFeatured' is true
        const featuredProducts = await Product.find({ isFeatured: true }).lean();

        // Update the Redis cache with the new list of featured products
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        // Log any errors that occur while updating the cache
        console.error("Error updating featured products cache:", error.message);
    }
};
