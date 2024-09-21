import { create } from "zustand";
import axios from "axios";
import { toast } from 'react-hot-toast';
import axiosInstance from '../lib/axios'

// Create a Zustand store to manage cart state
const useCartStore = create((set, get) => ({
    cart: [],  // Initialize cart as an empty array
    coupon: null,  // Initialize coupon as null
    total: 0,  // Initialize total price as 0
    subtotal: 0,  // Initialize subtotal as 0 (possibly for calculation purposes)
    isCouponApplied: false,


    getMyCoupon: async () => {
        try {
            const res = await axiosInstance.get("/coupons")
            set({ coupon: res.data })
        } catch (error) {
            console.error("Error fetching coupon:", error);
           
        }
    },

    appleCoupon: async (code) => {
        try {
            const res = await axiosInstance.post('/coupons/validate', { code })
            set({ coupon: res.data, isCouponApplied: true })
            get().calculateTotals();
            toast.success("Coupon applied successfully!");
        } catch (error) {
            console.error("Error applying coupon:", error);
            toast.error("Error applying coupon. Please try again.");
        }
    },

    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false })
        get().calculateTotals();
        toast.success("Coupon removed successfully!");
    },



 
        clearCart: async () => {
            set({ cart: [], coupon: null, total: 0, subtotal: 0 });
        },
 



    // Method to updateDateQuantity from the cart item
    updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
            get().removeFromCart(productId)
            return;
        }

        await axios.put(`/api/cart/${productId}`, { quantity });

        // Update local cart state by filtering out the updated product and adding the new quantity
        set((prevState) => ({
            cart: prevState.cart.map((item) =>
                item._id === productId ? { ...item, quantity } : item
            ),
        }));

        // Recalculate totals after the quantity is updated
        get().calculateTotals();

    },


    // Method to remove a product from the cart
    removeFromCart: async (productId) => {
        try {
            // DELETE request using productId in the URL
            await axios.delete(`/api/cart`, { data: { productId } });

            // Update local cart state by filtering out the removed product
            set((prevState) => ({
                cart: prevState.cart.filter((item) => item._id !== productId),
            }));

            // Recalculate totals after the product is removed
            get().calculateTotals();
        } catch (error) {
            // Display an error toast with a fallback message
            toast.error(error.response?.data?.message || "Error removing product from cart. Please try again.");
        }
    },




    // Method to add a product to the cart
    addToCart: async (product) => {
        try {
            const res = await axios.post("/api/cart", { productId: product._id });
            toast.success("Product added to cart!");
            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            get().calculateTotals();
        } catch (error) {
            // If an error occurs, display an error toast notification with a fallback message
            toast.error(error.response?.data?.message || "Error adding product to cart. Please try again.");
        }
    },

    // Fetch the current cart items from the backend API
    getCartItems: async () => {
        try {
            const res = await axios.get("/api/cart");
            set({ cart: res.data });  // Set the cart state with the fetched data
            get().calculateTotals();  // Recalculate the total price and subtotal
        } catch (error) {
            set({ cart: [] });  // If there's an error, reset the cart to empty
            console.error("Error fetching cart items:", error);  // Log error for debugging
        }
    },


    // Method to apply a coupon to the cart and calculate the total amount
    // calculateTotals: () => {
    //     const { cart, coupon } = get();

    //      // Ensure cart is an array and validate items
    // if (!Array.isArray(cart)) {
    //     console.error("Cart is not an array");
    //     set({ subtotal: 0, total: 0 }); // Set defaults if cart is invalid
    //     return;
    // }

    //     const subtotal = cart.reduce((sum, item) => item.price * item.quantity, 0);
    //     let total = subtotal;
    //     if (coupon) {
    //         total -= (coupon.percentage / 100) * subtotal;
    //     }

    //     set({ subtotal, total });
    // },



    calculateTotals: () => {
        const { cart, coupon } = get();

        if (!Array.isArray(cart)) {
            console.error("Cart is not an array");
            set({ subtotal: 0, total: 0 }); // Set defaults if cart is invalid
            return;
        }
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },


}));


export default useCartStore;