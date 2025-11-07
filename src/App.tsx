import { Route, Routes, Navigate } from 'react-router-dom';

import HomePage from './pages/Home.tsx';
import AboutPage from './pages/About.tsx';
import ContactPage from './pages/Contact.tsx';
import ProductsPage from './pages/Products.tsx';
import CheckoutPage from './pages/Checkout.tsx';
import ProductDetailPage from './pages/ProductDetail.tsx';
import MainLayout from './components/layout/MainLayout.tsx';

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/produtos/:id" element={<ProductDetailPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/reset-password" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
