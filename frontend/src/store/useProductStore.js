import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    // Method to set products
    setProducts: (products) => set({ products }),


  // Method to create products
    createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/api/products", productData);
            console.log(res.data)
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
            toast.success("Product created successfully!");
		} catch (error) {
			console.error("Error creating product:", error);
            toast.error("Error creating product. Please try again.");
            set({ loading: false });
		}
	},

    
    // Method to fetch products
    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            // Correct the API URL to use '/api/products'
            const res = await axios.get('/api/products');

            // Set the fetched products in the state
            set({ products: res.data.products, loading: false });
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Error fetching products. Please try again.");
            set({ loading: false });
        }
    },

    // Method to update a product
    toggleFeaturedProduct: async (id) => {
        set({ loading: true });
        try {
            // Make API request to update the product's 'isFeatured' status
            const res = await axios.put(`/api/products/${id}`);
            set((prevState) => ({
                products: prevState.products.map((product) =>
                    product._id === id ? { ...product, isFeatured: res.data.isFeatured } : product
                ),
                loading: false,
            }));
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Error updating product. Please try again.");
            set({ loading: false });
        }
    },

    // Method to delete a product
    deleteProduct: async (id) => {
        set({ loading: true });
        try {
            // Make API request to delete the product
            await axios.delete(`/api/products/${id}`);
            set((prevState) => ({
                products: prevState.products.filter((product) => product._id !== id),
                loading: false,
            }));
            toast.success("Product deleted successfully!");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Error deleting product. Please try again.");
            set({ loading: false });
        }
    },

    // Method fetch the product by Category
    fetchProductsByCategory: async (category) => {
        set({ loading: true });
        try {
            // Make API request to fetch products by category
            const res = await axios.get(`/api/products/category/${category}`);
            // Set the fetched products in the state
            set({ products: res.data.products, loading: false });
        } catch (error) {
            console.error("Error fetching products by category:", error);
            toast.error("Error fetching products by category. Please try again.");
            set({ loading: false });
        }


    },


    fetchFeatureProducts: async () => {
        set({ loading: true });
        try {
            // Make API request to fetch featured products
            const res = await axios.get(`/api/products/featured`);

            // Set the fetched products in the state  
            set({ products: res.data ,loading: false });
        } catch (error) {
            console.error("Error fetching featured products:", error);
            toast.error("Error fetching featured products. Please try again.");
            set({ loading: false });
        }
    }


}));
