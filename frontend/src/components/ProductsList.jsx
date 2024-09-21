import React, { useState } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../store/useProductStore";
import { Loader, Star, Trash } from "lucide-react";

function ProductsList() {
  const { products, toggleFeaturedProduct, deleteProduct } = useProductStore();

  // Local state to track loading status for individual products
  const [loadingStates, setLoadingStates] = useState({});

  // Handle toggling the featured state with individual loading states
  const handleToggleFeatured = async (productId) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: "featured" })); // Set the specific product's loading state to 'featured'
    await toggleFeaturedProduct(productId);
    setLoadingStates((prev) => ({ ...prev, [productId]: false })); // Reset the loading state after action
  };

  // Handle deleting a product with individual loading states
  const handleDeleteProduct = async (productId) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: "delete" })); // Set the specific product's loading state to 'delete'
    await deleteProduct(productId);
    setLoadingStates((prev) => ({ ...prev, [productId]: false })); // Reset the loading state after action
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className=" min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Category
            </th>

            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Featured
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products?.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {product.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  ${product.price.toFixed(2)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleToggleFeatured(product._id)}
                  className={`p-1 rounded-full ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-600 text-gray-300"
                  } hover:bg-yellow-500 transition-colors duration-200`}
                >
                  {/* {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Star className="h-5 w-5" />
                  )} */}

                  {loadingStates[product._id] === "featured" ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Star className="h-5 w-5" />
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  {/* {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash className="h-5 w-5" />
                  )} */}

                  {loadingStates[product._id] === "delete" ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash className="h-5 w-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export default ProductsList;
