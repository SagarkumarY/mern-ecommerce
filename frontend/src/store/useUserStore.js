import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from 'react-hot-toast';


const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    error: null,

    // Method to sign up a user
    signup: async ({ name, email, password, confirmPassword }) => {
        // Set loading state to true, reset error
        set({ loading: true, error: null });

        // Check if passwords match (trim spaces to prevent user input errors)
        if (password.trim() !== confirmPassword.trim()) {
            toast.error("Passwords do not match!");
            set({ loading: false });
            return;
        }

        try {
            // Make API request to sign up the user
            const response = await axios.post("/auth/signup", { name, email, password });

            // Notify user of successful signup
            toast.success("Signup successful!");

            // Set the user data in state and update auth status
            set({
                user: response.data.user,
                loading: false,
                checkingAuth: false
            });

            // Optionally clear password inputs
            set({ password: "", confirmPassword: "" });

        } catch (error) {
            // Fallback to a generic message if specific error details are unavailable
            const errorMessage = error.response?.data?.message || "An error occurred during signup. Please try again.";

            // Display error message to the user
            toast.error(errorMessage);

            // Set error state and stop loading
            set({ loading: false, error: errorMessage });
        }
    },


    // Method to log in a user
    login: async ({ email, password }) => {
        // Set loading state to true, reset error
        set({ loading: true, error: null });
        try {
            // Make API request to sign up the user
            const response = await axios.post("/auth/login", { email, password });
            // Notify user of successful signup
            toast.success("Login successful!");

            // Set the user data in state and update auth status
            set({
                user: response.data.user,
                loading: false,
                checkingAuth: false
            });

            // Optionally clear password inputs
            set({ password: "", confirmPassword: "" });

        } catch (error) {
            // Fallback to a generic message if specific error details are unavailable
            const errorMessage = error.response?.data?.message || "An error occurred during login. Please try again.";

            // Display error message to the user
            toast.error(errorMessage);

            // Set error state and stop loading
            set({ loading: false, error: errorMessage });
        }
    },


    // Method to log out a user
    logout: async () => {
        set({ loading: true, error: null });

        try {
            await axios.post("/auth/logout");
            toast.success("Logout successful!");
            set({ user: null, loading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "An error occurred during logout.";
            toast.error(errorMessage);
            set({ loading: false, error: errorMessage });
        }
    },

    // Method to check authentication status
    checkAuth: async () => {
        set({ checkingAuth: true });

        try {
            // Use relative URL since Vite proxy will handle the request
            const response = await axios.get("/auth/profile");

            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            set({ checkingAuth: false, user: null });
        }
    },


    refreshToken: async () => {
        if (get().checkingAuth()) return;  // Prevents running if authentication check is already in progress

        set({ checkingAuth: true });  // Indicate that the authentication process is in progress
        try {
            const res = await axios.post("/api/auth/refresh-token");  // Send a request to refresh the token
            set({ checkingAuth: false });  // Stop checking once the token has been refreshed
            return res.data;  // Return the response from the server
        } catch (error) {
            set({ user: null, checkingAuth: false });  // If an error occurs, log the user out
            throw error;  // Propagate the error for further handling
        }
    },


}));


// TODO: Implement the axios interceptor for refreshing access token

// Axios interceptor for refreshing access token
let refreshPromise = null;
axios.interceptors.response.use(
    (response) => response,  // If the response is successful, just return it

    async (error) => {
        const originalRequest = error.config;  // Save the original request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;  // Mark this request so it doesn't retry infinitely

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);  // Retry the original request
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();  // Call the refreshToken method
                await refreshPromise;  // Wait for the refresh token request to complete
                refreshPromise = null;  // Reset the promise after it's done

                // Retry the original request with the new access token
                return axios(originalRequest);
            } catch (error) {
                // If refresh fails, log the user out and reject the request
                useUserStore.getState().logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);  // If the error isn't 401 or refresh fails, reject the error
    }
);






export default useUserStore;
