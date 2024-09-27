// store/useInvoiceStore.js

import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useInvoiceStore = create((set) => ({
  invoiceStatus: null, // Tracks the status of the invoice ("pending", "success", "error")
  error: null, // Tracks any error message
  
  // Function to generate and send the invoice
  sendInvoice: async (name, email, items) => {
    set({ invoiceStatus: "pending", error: null });

    try {
      // Send a POST request to your invoice API
      const response = await axiosInstance.post("/send-invoice", {
        name,
        email,
        items,
      });
      toast.success("Invoice sent successfully your email address")
      set({ invoiceStatus: "success" });
    } catch (error) {
      console.error("Error sending invoice:", error);
      set({ invoiceStatus: "error", error: error.message });
    }
  },
  
  // Function to reset the invoice status (optional)
  resetInvoiceStatus: () => {
    set({ invoiceStatus: null, error: null });
  },
}));

export default useInvoiceStore;
