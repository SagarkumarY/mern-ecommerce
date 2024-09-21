import React from "react";
import { motion } from "framer-motion";
import useCartStore from "../store/useCartStore";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
// import axios from "../lib/axios";
import axios from "axios";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  "pk_test_51PvMv3F9YmovNi58yvJqsTpkey2oBh9Wbl1Gfkk29liHJEoNyVUsSlp0h0FhMTs2SaitMLlyU3PB8QDMmtYAQc3100kKdDqiU9"
);

function OrderSummary() {
  const { total, subtoatal, coupon, isCouponApplied, cart } = useCartStore();

  const savings = subtoatal - total;
  const formattedSubtotal = subtoatal?.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      const res = await axios.post("/api/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
      });

      const {sessionId} = await res.data;
      const result = await stripe.redirectToCheckout({ sessionId: sessionId });
      if (result.error) {
        console.error("Error redirecting to Stripe:", result.error);
        toast.error("Error processing payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Error processing payment. Please try again.");
    }
  };
  return (
    <motion.div
      className=" space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>
      <div className="space-y-4">
        <div className="space-y-2">
          <dl className=" flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dt className="text-base font-medium text-white">
              ${formattedSubtotal}
            </dt>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dt className="text-base font-medium text-emerald-400">
                ${formattedSavings}
              </dt>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code}){" "}
              </dt>
              <dt className="text-base font-medium text-emerald-400">
                -{coupon.discountPercentage}%
              </dt>
            </dl>
          )}

          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-bold text-white">Total</dt>
            <dt className="text-base  font-bold text-emerald-400">
              ${formattedTotal}
            </dt>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default OrderSummary;
