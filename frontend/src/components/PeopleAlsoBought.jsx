import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import LoadingSpinner from './LoadingSpinner';

function PeopleAlsoBought() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch recommendations from the API
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching data

      try {
        const response = await axios.get("/products/recommendations");

        if (response.data.length === 0) {
          setError("No recommendations available."); // Handle empty data
        } else {
          setRecommendations(response.data.products);
        }
      } catch (error) {
        console.error(
          "Error fetching recommendations in PeopleAlsoBrought component:",
          error
        );
        setError("Failed to load recommendations. Please try again later.");
      } finally {
        setLoading(false); // Stop loading spinner after data is fetched
      }
    };

    fetchRecommendations();
  }, []);

  // Display loading spinner if the data is being fetched
  if (loading) return <LoadingSpinner />;

  // Display error message if fetching recommendations failed
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-emerald-400">
        People also bought
      </h3>

      {/* If no recommendations, show a message */}
      {recommendations.length === 0 ? (
        <p className="text-gray-500 mt-4">No products to display.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PeopleAlsoBought;
