import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage, SignupPage, LoginPage, AdminPage, CartPage, PurchaseSuccessPage, PurchaseCancelPage, CategoryPage } from "./pages";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import useUserStore from "./store/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import useCartStore from "./store/useCartStore";



function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch cart items only after the user has been authenticated
  useEffect(() => {
    if (user) {
      // Only fetch the cart items if the user is authenticated
      getCartItems();
    }
  }, [user, getCartItems]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className=" min-h-screen bg-gray-900 text-white  relative  overflow-hidden">
      {/* {"backgrouond gradien"} */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      <div className=" relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route path="/login" element={!user ? <LoginPage /> : <HomePage />} />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          />

          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/cart"
            element={user ? <CartPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />

           <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
