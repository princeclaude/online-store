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

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const isAdmin = user?.email === "admin@classicroyal.com";

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/bag" element={<BagScreen />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/upload" element={<UploadProduct />} />
        <Route path="/section" element={<CategorySection />} />
        <Route path="/header" element={<HeaderComponent />} />
        <Route path="/signinmodal" element={<SignInModal />} />
        <Route path="/search" element={<SearchModal />} />
        <Route path="/flashsale" element={<FlashSalesBanner />} />
        <Route path="/allproducts" element={<AdminAllProducts />} />
        <Route path="/editproduct/:id" element={<EditProductPage />} />
        <Route path="/footer" element={<FooterComponent />} />
        {isAdmin && <Route path="/save" element={<SavePixabayImage />} />}
      </Routes>
      
    </>
  );
}
export default App;
