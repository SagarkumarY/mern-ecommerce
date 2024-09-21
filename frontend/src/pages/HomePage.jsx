import { useEffect } from "react";
import Category from "../components/Category";
import { useProductStore } from "../store/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/jeans", name: "Jeans", imgUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-Shirts", imgUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imgUrl: "/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imgUrl: "/glasses.png" },
  { href: "/bag", name: "Bags", imgUrl: "/bags.jpg" },
  { href: "/jackets", name: "Jackets", imgUrl: "/jackets.jpg" },
  { href: "/suit", name: "Suits", imgUrl: "/suits.jpg" },
  { href: "/accessories", name: "Accessories", imgUrl: "/accessories.jpg" },
  { href: "/watches", name: "Watches", imgUrl: "/watches.jpg" },
  { href: "/kids", name: "Kids", imgUrl: "/kids.jpg" },
];

function HomePage() {

  const {fetchFeatureProducts, products, isLoading} = useProductStore();


  useEffect(() => {
   fetchFeatureProducts();
  }, [fetchFeatureProducts])

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className=" relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">Explore Our Categories</h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest in eco-friendly fashion
        </p>
        <div className=" grid grid-cols-1 lg:grid-cols-3  sm:grid-cols-2 gap-4">
          {categories.map((category,index) =>  (
            <Category key={index} category={category} />
          ))}
        </div>

        {!isLoading && products.length > 0 && <FeaturedProducts  featuredProduct={products} />}
      </div>
    </div>
  );
}

export default HomePage;
