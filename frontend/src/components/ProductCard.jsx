import { ShoppingCart } from "lucide-react";
import React from "react";
import { toast } from "react-hot-toast";
import  useUserStore  from "../store/useUserStore";
import useCartStore from '../store/useCartStore'


function ProductCard({ product }) {
  const { user } = useUserStore();
  const {addToCart} = useCartStore()


  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to add items to cart", { id: "login" });
      return;
    } else {
      await addToCart(product);
    }
  };
  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          src={product?.image}
          alt="product img"
          className=" object-cover w-full"
        />
        <div className=" absolute inset-0 bg-black bg-opacity-20" />
      </div>
      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product?.name}
        </h5>
        <p>
          <span className="text-3xl font-bold text-emerald-400">
            ${product?.price}
          </span>
        </p>

        <button
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:right-4 focus:ring-emerald-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className="mr2" />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
