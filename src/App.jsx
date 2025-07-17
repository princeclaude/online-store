import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Pages & Components
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import UploadProduct from "./utils/UploadProduct";
import SavePixabayImage from "./pages/admin/SavePixabayImage";
import Home from "./pages/Home";
import CategorySection from "./components/CategorySection";
import HeaderComponent from "./components/HeaderComponent";
import SignInModal from "./components/SignInModal";
import SearchModal from "./components/SearchModal";
import BagScreen from "./components/BagScreen";
import SettingsPage from "./components/SettingsPage";
import FlashSalesBanner from "./components/FlashSalesBanner";
import ProductDetailPage from "./components/ProductDetailPage";
import FooterComponent from "./components/FooterComponent";
import AdminAllProducts from "./components/AdminAllProducts";
import EditProductPage from "./components/EditProductPage";
import { Toaster } from "react-hot-toast";

// ✅ Protected Route wrappers
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  const { loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/section" element={<CategorySection />} />
        <Route path="/header" element={<HeaderComponent />} />
        <Route path="/signinmodal" element={<SignInModal />} />
        <Route path="/search" element={<SearchModal />} />
        <Route path="/flashsale" element={<FlashSalesBanner />} />
        <Route path="/footer" element={<FooterComponent />} />

        {/* ✅ Protected Routes (for any signed-in user) */}
        <Route
          path="/bag"
          element={
            <PrivateRoute>
              <BagScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />

        {/* ✅ Admin-only Routes */}
        
        <Route
          path="/save"
          element={
            <AdminRoute>
              <SavePixabayImage />
            </AdminRoute>
          }
        />
        <Route
          path="/allproducts"
          element={
            <AdminRoute>
              <AdminAllProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/editproduct/:id"
          element={
            <AdminRoute>
              <EditProductPage />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
